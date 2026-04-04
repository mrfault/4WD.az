#!/usr/bin/env python3
"""
4WD.az Auto Blog - Offroad məqalələri scrape + tərcümə + publish
Gündə 1-2 dəfə cron ilə işləyir
"""

import os
import re
import sys
import json
import time
import random
import hashlib
import logging
import requests
import psycopg2
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup

# ============ CONFIG ============
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5432,
    "dbname": "fourwd_az",
    "user": "fourwd",
    "password": "fourwd_secure_2024",
}

STORAGE_PATH = "/var/www/4wd.az/backend/storage/app/public/blog"
LOG_DIR = "/var/www/4wd.az/scripts/logs"
HISTORY_FILE = "/var/www/4wd.az/scripts/posted_urls.json"

# ============ SOURCES ============
SOURCES = [
    {
        "name": "OffroadXtreme",
        "base_url": "https://www.offroadxtreme.com",
        "feed_urls": [
            "https://www.offroadxtreme.com/features/",
            "https://www.offroadxtreme.com/news/",
        ],
        "lang": "en",
        "article_selector": "a[href*='/features/'], a[href*='/news/']",
        "title_selector": "h1",
        "content_selector": "div.entry-content, .post-content, article .content, .article-body",
        "image_selector": ".entry-content img, .post-content img, article img",
    },
    {
        "name": "ExpeditionPortal",
        "base_url": "https://expeditionportal.com",
        "feed_urls": [
            "https://expeditionportal.com/4wd/",
            "https://expeditionportal.com/overland-tech/",
        ],
        "lang": "en",
        "article_selector": "article a, .post-card a, .entry-title a, a[href*='expeditionportal.com/']",
        "title_selector": "h1",
        "content_selector": "div.entry-content, .post-content, article .content",
        "image_selector": ".entry-content img, .post-content img, article img",
    },
    {
        "name": "FourWheeler",
        "base_url": "https://www.motortrend.com",
        "feed_urls": [
            "https://www.motortrend.com/four-wheeler-magazine/",
        ],
        "lang": "en",
        "article_selector": "a[href*='/features/'], a[href*='/how-to/'], a[href*='/news/']",
        "title_selector": "h1",
        "content_selector": "div.article-body, .entry-content, .post-content",
        "image_selector": "article img, .article-body img, picture img",
    },
]

# offroad-related keywords for filtering
OFFROAD_KEYWORDS = [
    "offroad", "off-road", "4x4", "4wd", "overland", "jeep", "wrangler",
    "land cruiser", "pajero", "hilux", "defender", "tacoma", "bronco",
    "winch", "lift kit", "suspension", "snorkel", "bumper", "roof rack",
    "recovery", "mud", "trail", "rock crawl", "tire", "wheel",
    "camping", "expedition", "overlanding", "truck", "suv",
    "ford ranger", "toyota", "nissan patrol", "mitsubishi",
]

# ============ LOGGING ============
os.makedirs(LOG_DIR, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(f"{LOG_DIR}/auto_blog.log"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("auto_blog")

# ============ HELPERS ============

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    return []

def save_history(history):
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

def slugify(text):
    text = text.lower().strip()
    replacements = {
        "ı": "i", "ğ": "g", "ü": "u", "ş": "s", "ö": "o", "ç": "c",
        "ə": "e", "İ": "i", "Ğ": "g", "Ü": "u", "Ş": "s", "Ö": "o",
        "Ç": "c", "Ə": "e",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text)
    return text[:80].strip("-")

def get_headers():
    agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    ]
    return {
        "User-Agent": random.choice(agents),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

def is_offroad_related(text):
    text_lower = text.lower()
    return any(kw in text_lower for kw in OFFROAD_KEYWORDS)

def download_image(url, filename):
    """Download image and save to blog storage"""
    try:
        os.makedirs(STORAGE_PATH, exist_ok=True)
        resp = requests.get(url, headers=get_headers(), timeout=30, stream=True)
        resp.raise_for_status()

        content_type = resp.headers.get("Content-Type", "")
        if "jpeg" in content_type or "jpg" in content_type:
            ext = ".jpg"
        elif "png" in content_type:
            ext = ".png"
        elif "webp" in content_type:
            ext = ".webp"
        else:
            ext = os.path.splitext(urlparse(url).path)[1] or ".jpg"

        safe_name = re.sub(r"[^a-zA-Z0-9_-]", "", filename)[:50]
        final_name = f"{safe_name}{ext}"
        filepath = os.path.join(STORAGE_PATH, final_name)

        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)

        log.info(f"Image saved: {final_name}")
        return f"blog/{final_name}"
    except Exception as e:
        log.error(f"Image download failed: {url} - {e}")
        return None


# ============ SCRAPER ============

def fetch_article_links(source):
    """Get article links from a source listing page"""
    links = []
    for feed_url in source["feed_urls"]:
        try:
            resp = requests.get(feed_url, headers=get_headers(), timeout=30)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            # Try configured selector
            elements = soup.select(source["article_selector"])

            # Fallback: any link that looks article-like
            if not elements:
                elements = soup.find_all("a", href=True)

            for el in elements:
                href = el.get("href", "")
                if not href:
                    a_tag = el.find("a", href=True)
                    if a_tag:
                        href = a_tag.get("href", "")

                if href:
                    full_url = urljoin(source["base_url"], href)
                    parsed = urlparse(full_url)
                    path = parsed.path
                    # Must be article-like URL (has slug path segments)
                    if (
                        parsed.netloc in urlparse(source["base_url"]).netloc
                        and len(path.split("/")) >= 3
                        and not path.endswith((".xml", ".rss", ".json", ".js", ".css"))
                        and "/tag/" not in path
                        and "/category/" not in path
                        and "/author/" not in path
                    ):
                        links.append(full_url)

            log.info(f"Found {len(links)} links from {source['name']}")
        except Exception as e:
            log.error(f"Failed to fetch links from {source['name']}: {e}")

    return list(dict.fromkeys(links))  # deduplicate keeping order


def scrape_article(url, source):
    """Scrape a single article"""
    try:
        resp = requests.get(url, headers=get_headers(), timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # Title
        title_el = soup.select_one(source["title_selector"])
        if not title_el:
            return None
        title = title_el.get_text(strip=True)

        if not title or len(title) < 10:
            return None

        # Check if offroad related
        page_text = soup.get_text()[:3000]
        if not is_offroad_related(title + " " + page_text):
            log.info(f"Skipping non-offroad: {title[:60]}")
            return None

        # Content
        content_el = None
        for selector in source["content_selector"].split(", "):
            content_el = soup.select_one(selector.strip())
            if content_el:
                break

        if not content_el:
            # Fallback: try article tag
            content_el = soup.find("article")

        if not content_el:
            return None

        # Extract paragraphs AND images in order
        blocks = []
        seen_images = set()
        img_counter = 0

        for el in content_el.find_all(["p", "h2", "h3", "li", "img", "figure"]):
            if el.name == "figure":
                # Extract img from figure
                img_tag = el.find("img")
                if img_tag:
                    src = img_tag.get("src") or img_tag.get("data-src") or img_tag.get("data-lazy-src") or ""
                    alt = img_tag.get("alt", "")
                    if src and not src.endswith((".svg", ".gif", ".ico")) and src not in seen_images:
                        seen_images.add(src)
                        img_counter += 1
                        blocks.append({"tag": "img", "src": urljoin(url, src), "alt": alt, "index": img_counter})
                # Also get caption text
                caption = el.find("figcaption")
                if caption:
                    text = caption.get_text(strip=True)
                    if text:
                        blocks.append({"tag": "caption", "text": text})
            elif el.name == "img":
                src = el.get("src") or el.get("data-src") or el.get("data-lazy-src") or ""
                alt = el.get("alt", "")
                if src and not src.endswith((".svg", ".gif", ".ico")) and src not in seen_images:
                    seen_images.add(src)
                    img_counter += 1
                    blocks.append({"tag": "img", "src": urljoin(url, src), "alt": alt, "index": img_counter})
            else:
                text = el.get_text(strip=True)
                if len(text) > 20:
                    blocks.append({"tag": el.name, "text": text})

        # Count actual content blocks (not images)
        text_blocks = [b for b in blocks if b["tag"] not in ("img", "caption")]
        if len(text_blocks) < 3:
            return None

        # Build content with image placeholders
        content_parts = []
        for b in blocks:
            if b["tag"] in ("h2", "h3"):
                content_parts.append(f"## {b['text']}")
            elif b["tag"] == "img":
                content_parts.append(f"[IMAGE_{b['index']}]")
            elif b["tag"] == "caption":
                content_parts.append(f"[CAPTION: {b['text']}]")
            elif b["tag"] != "caption":
                content_parts.append(b["text"])

        content_text = "\n\n".join(content_parts)

        # Collect all images in order
        images = []

        # Featured/og image first
        og_img = soup.select_one("meta[property='og:image']")
        og_url = None
        if og_img:
            og_url = og_img.get("content", "")
            if og_url:
                images.append({"url": urljoin(url, og_url), "alt": title, "type": "featured"})

        # Content images
        for b in blocks:
            if b["tag"] == "img":
                img_url = b["src"]
                # Skip if same as og image
                if og_url and img_url == urljoin(url, og_url):
                    continue
                images.append({"url": img_url, "alt": b.get("alt", ""), "type": "content", "index": b["index"]})

        return {
            "title": title,
            "content": content_text,
            "images": images,
            "source_url": url,
            "source_name": source["name"],
            "lang": source["lang"],
        }
    except Exception as e:
        log.error(f"Failed to scrape {url}: {e}")
        return None


# ============ TRANSLATOR (Claude) ============

def translate_with_claude(title, content, source_lang):
    """Translate article to Azerbaijani using Claude API"""
    lang_name = "rus" if source_lang == "ru" else "ingilis"

    prompt = f"""Sən peşəkar offroad və 4x4 avtomobil jurnalistisən, 4WD.az saytı üçün yazırsan.

Aşağıdakı {lang_name} dilindəki məqaləni Azərbaycan dilinə tərcümə et və yenidən yaz.

QAYDALAR:
1. Tərcümə təbii və axıcı olmalıdır, sözbəsöz tərcümə etmə
2. Offroad terminlərini düzgün istifadə et - winch (bucurqad), lift kit, suspension (asma), snorkel, bumper (bamper), roof rack (dam bagajı) kimi texniki terminləri saxla, ilk istifadədə mötərizədə Azərbaycan dilində izah et
3. Məqalənin strukturunu qoru, başlıqlar və abzaslar olsun
4. Minimum 800 söz olmalıdır, mövzunu ətraflı aç
5. HTML formatında ver: <h2>, <p>, <strong>, <ul>, <li> tagları istifadə et
6. Əgər qiymət dollarda verilərsə, manatla ekvivalentini də əlavə et (1 USD ≈ 1.70 AZN)
7. Sonda "Bu məqalə 4WD.az üçün hazırlanmışdır" kimi heç nə əlavə etmə
8. Yalnız tərcümə olunmuş məqaləni ver, öz şərhlərini əlavə etmə
9. VACIB: Mətndə [IMAGE_1], [IMAGE_2] və s. placeholder-lər var. Onları OLDUĞU KİMİ saxla, silmə və dəyişdirmə. Onlar sonradan real şəkillərlə əvəz olunacaq. Placeholder-ləri mətnin uyğun yerində <p> tagının daxilində saxla, məsələn: <p>[IMAGE_1]</p>

ORIJINAL BAŞLIQ: {title}

ORIJINAL MƏTN:
{content[:8000]}

Cavabı YALNIZ bu JSON formatında ver, başqa heç nə yazma:
{{
  "title_az": "Azərbaycan dilində başlıq",
  "content_az": "<h2>...</h2><p>...</p><p>[IMAGE_1]</p><p>...</p>...",
  "excerpt_az": "2-3 cümlə xülasə",
  "meta_title_az": "SEO başlıq, max 60 simvol",
  "meta_description_az": "SEO açıqlama, max 155 simvol",
  "category_tag": "bunlardan biri: accessories, tires, suspension, lighting, recovery, camping, tuning, snorkels, tips"
}}"""

    try:
        resp = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 4096,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=120,
        )
        resp.raise_for_status()
        data = resp.json()
        text = data["content"][0]["text"]

        # Extract JSON from response
        json_match = re.search(r"\{[\s\S]*\}", text)
        if json_match:
            result = json.loads(json_match.group())
            log.info(f"Translation done: {result.get('title_az', '')[:60]}")
            return result
        else:
            log.error("No JSON in Claude response")
            return None
    except Exception as e:
        log.error(f"Claude API error: {e}")
        return None


# ============ DATABASE ============

def slug_exists(slug):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM blog_posts WHERE slug = %s", (slug,))
        exists = cur.fetchone() is not None
        cur.close()
        conn.close()
        return exists
    except Exception as e:
        log.error(f"DB error checking slug: {e}")
        return True

def insert_blog_post(translated, featured_image_path):
    """Insert translated article into database"""
    slug = slugify(translated["title_az"])

    # Ensure unique slug
    base_slug = slug
    counter = 1
    while slug_exists(slug):
        slug = f"{base_slug}-{counter}"
        counter += 1

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO blog_posts
            (slug, title_az, title_en, excerpt_az, excerpt_en, content_az, content_en,
             featured_image, category_tag, is_published, published_at,
             meta_title_az, meta_title_en, meta_description_az, meta_description_en,
             created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            slug,
            translated["title_az"],
            translated["title_az"],
            translated.get("excerpt_az", ""),
            translated.get("excerpt_az", ""),
            translated["content_az"],
            translated["content_az"],
            featured_image_path,
            translated.get("category_tag", "offroad"),
            True,
            datetime.now(),
            translated.get("meta_title_az", translated["title_az"][:60]),
            translated.get("meta_title_az", translated["title_az"][:60]),
            translated.get("meta_description_az", ""),
            translated.get("meta_description_az", ""),
            datetime.now(),
            datetime.now(),
        ))
        post_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        log.info(f"Published: [{post_id}] {slug}")
        return post_id
    except Exception as e:
        log.error(f"DB insert error: {e}")
        return None


# ============ MAIN ============

def run():
    log.info("=" * 50)
    log.info("4WD.az Auto Blog started")

    history = load_history()

    # Shuffle sources for variety
    sources = SOURCES.copy()
    random.shuffle(sources)

    for source in sources:
        log.info(f"Trying source: {source['name']}")

        links = fetch_article_links(source)
        if not links:
            log.info(f"No links found for {source['name']}, trying next...")
            continue

        # Filter out already posted
        new_links = [l for l in links if l not in history]
        if not new_links:
            log.info(f"All links already posted from {source['name']}")
            continue

        log.info(f"Found {len(new_links)} new links from {source['name']}")

        # Pick random articles to try
        random.shuffle(new_links)

        for link in new_links[:5]:
            log.info(f"Scraping: {link}")
            article = scrape_article(link, source)

            if not article:
                history.append(link)  # mark as tried
                continue

            if len(article["content"]) < 300:
                log.info("Article too short, skipping")
                history.append(link)
                continue

            # Translate
            log.info(f"Translating: {article['title'][:60]}...")
            translated = translate_with_claude(
                article["title"],
                article["content"],
                article["lang"],
            )

            if not translated or "title_az" not in translated or "content_az" not in translated:
                log.error("Translation failed")
                continue

            # Download ALL images and replace placeholders in content
            featured_image_path = None
            content_html = translated["content_az"]

            for img_info in article["images"]:
                img_url = img_info["url"]
                img_hash = hashlib.md5(img_url.encode()).hexdigest()[:12]
                saved_path = download_image(img_url, f"auto-{img_hash}")

                if saved_path:
                    # Set featured image (first one)
                    if featured_image_path is None:
                        featured_image_path = saved_path

                    # Replace placeholder in content with actual <img> tag
                    if img_info["type"] == "content" and "index" in img_info:
                        placeholder = f"[IMAGE_{img_info['index']}]"
                        img_alt = img_info.get("alt", "4WD.az offroad")
                        img_tag = f'<img src="https://4wd.az/storage/{saved_path}" alt="{img_alt}" style="width:100%;border-radius:8px;margin:16px 0;" />'
                        content_html = content_html.replace(placeholder, img_tag)
                        # Also try with <p> wrapper
                        content_html = content_html.replace(f"<p>{img_tag}</p>", f"{img_tag}")

            # Clean up any remaining unreplaced placeholders
            content_html = re.sub(r'<p>\[IMAGE_\d+\]</p>', '', content_html)
            content_html = re.sub(r'\[IMAGE_\d+\]', '', content_html)
            content_html = re.sub(r'\[CAPTION: [^\]]*\]', '', content_html)

            translated["content_az"] = content_html

            # Insert into DB
            post_id = insert_blog_post(translated, featured_image_path)

            if post_id:
                history.append(link)
                save_history(history)
                log.info(f"SUCCESS! Post #{post_id} published from {source['name']}")
                return True

            history.append(link)

        save_history(history)
        log.info(f"No suitable article from {source['name']}")

    log.warning("No article published this run")
    save_history(history)
    return False


if __name__ == "__main__":
    run()
