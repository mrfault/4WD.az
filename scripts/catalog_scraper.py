#!/usr/bin/env python3
"""
4WD.az Catalog Scraper - drom.ru-dan avtomobil spesifikasiyalarını scrape edir

drom.ru strukturu:
  /catalog/bmw/              → brendin bütün modelləri
  /catalog/bmw/ix1/          → modelin nəsilləri (g_XXXX_XXXXX linkləri)
  /catalog/bmw/ix1/g_2022_15776/  → nəsilin modifikasiyaları (numeric ID linkləri)
  /catalog/bmw/ix1/434202/        → modifikasiyanın tam spec-ləri

İstifadə:
  python3 catalog_scraper.py "https://www.drom.ru/catalog/bmw/ix1/"
  python3 catalog_scraper.py --brand bmw
"""

import os
import re
import sys
import time
import random
import hashlib
import logging
import argparse
import requests
import psycopg2
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup

# ============ CONFIG ============

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "127.0.0.1"),
    "port": int(os.environ.get("DB_PORT", 5432)),
    "dbname": os.environ.get("DB_DATABASE", "fourwd_az"),
    "user": os.environ.get("DB_USERNAME", "fourwd"),
    "password": os.environ.get("DB_PASSWORD", "fourwd_secure_2024"),
}

_SCRIPT_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _SCRIPT_DIR.parent
STORAGE_PATH = os.environ.get(
    "CATALOG_STORAGE_PATH",
    str(_PROJECT_ROOT / "backend" / "storage" / "app" / "public" / "catalog"),
)
LOG_DIR = os.environ.get("CATALOG_LOG_DIR", str(_SCRIPT_DIR / "logs"))
DROM_BASE = "https://www.drom.ru"

# ============ LOGGING ============
os.makedirs(LOG_DIR, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(f"{LOG_DIR}/catalog_scraper.log"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("catalog_scraper")

# ============ TRANSLATION ============

SPEC_GROUP_MAP = {
    "Общая информация": "Ümumi məlumat",
    "Двигатель": "Mühərrik",
    "Трансмиссия": "Transmissiya",
    "Подвеска и тормоза": "Asqı və əyləclər",
    "Размеры": "Ölçülər",
    "Динамика": "Dinamika",
    "Расход топлива": "Yanacaq sərfiyyatı",
    "Рулевое управление": "Sükan idarəetməsi",
    "Шины и диски": "Təkərlər və disklər",
    "Аэродинамика": "Aerodinamika",
    "Масса": "Kütlə",
    "Электромотор": "Elektrik mühərriki",
    "Батарея": "Batareya",
    "Безопасность": "Təhlükəsizlik",
    "Салон и комфорт": "Salon və komfort",
    "Колёса": "Təkərlər",
    "Шины": "Şinlər",
    "Основные": "Əsas göstəricilər",
    "Основные характеристики": "Əsas göstəricilər",
}

SPEC_KEY_MAP = {
    # Ümumi
    "Название комплектации": "Komplektasiya",
    "Период выпуска": "Buraxılış dövrü",
    "Тип привода": "Ötürücü növü",
    "Тип кузова": "Kuzov tipi",
    "Тип трансмиссии": "Transmissiya növü",
    "Страна сборки": "Yığılma ölkəsi",
    "Число дверей": "Qapı sayı",
    "Число мест": "Oturacaq sayı",
    "Количество рядов сидений": "Oturacaq sıra sayı",
    "Используемое топливо": "Yanacaq növü",
    # Dinamika
    "Время разгона 0-100 км/ч, с": "0-100 km/s, san",
    "Максимальная скорость, км/ч": "Maks. sürət, km/s",
    "Клиренс (высота дорожного просвета), мм": "Klirens, mm",
    # Ölçülər
    "Габариты кузова (Д x Ш x В), мм": "Ölçülər (U x E x H), mm",
    "Колесная база, мм": "Təkər bazası, mm",
    "Ширина передней колеи, мм": "Ön təkər izi, mm",
    "Ширина задней колеи, мм": "Arxa təkər izi, mm",
    "Передний свес": "Ön çıxıntı, mm",
    "Задний свес": "Arxa çıxıntı, mm",
    # Kütlə
    "Масса, кг": "Kütlə, kq",
    "Максимальная грузоподъёмность": "Maks. yükqaldırma, kq",
    "Допустимая полная масса, кг": "İcazə verilən tam kütlə, kq",
    "Допустимый вес прицепа без тормозов, кг": "Əyləcsiz qoşqu çəkisi, kq",
    "Допустимый вес прицепа с тормозами, кг": "Əyləcli qoşqu çəkisi, kq",
    "Удельная масса, кг/л.с.": "Xüsusi kütlə, kq/a.g.",
    # Baqaj / aerodinamika
    "Объем багажника, л": "Baqaj həcmi, l",
    "Коэффициент аэродинамического сопротивления, cW": "Aerodinamik əmsal, cW",
    # Mühərrik / Elektrik
    "Тип двигателя": "Mühərrik tipi",
    "Нагнетатель": "Kompressor",
    "Максимальная мощность, л.с. (кВт) при об./мин.": "Maks. güc, a.g. (kVt)",
    "Запас хода на электротяге в км": "Elektrik yürüş ehtiyatı, km",
    "Электродвигатель: мощность, кВт": "Elektrik mühərrik gücü, kVt",
    "Электродвигатель: крутящий момент, Нм": "Elektrik fırlanma momenti, Nm",
    "Электродвигатель: 30-минутная мощность, л.с.": "30 dəq. güc, a.g.",
    "Ёмкость батареи, кВт*ч": "Batareya tutumu, kVt·s",
    # Sükan / asqı / əylec
    "Гидроусилитель руля": "Sükan gücləndiricisi",
    "Передняя подвеска": "Ön asqı",
    "Задняя подвеска": "Arxa asqı",
    "Пневматическая подвеска": "Pnevmatik asqı",
    "Передние тормоза": "Ön əyləclər",
    "Задние тормоза": "Arxa əyləclər",
    "Стояночный тормоз": "Dayanma əyləci",
    # Təkərlər
    "Передние диски": "Ön disklər",
    "Передние диски (опция)": "Ön disklər (opsiya)",
    "Задние диски": "Arxa disklər",
    "Задние диски (опция)": "Arxa disklər (opsiya)",
    "Передние колеса": "Ön təkərlər",
    "Передние колеса (опция)": "Ön təkərlər (opsiya)",
    "Задние колеса": "Arxa təkərlər",
    "Задние колеса (опция)": "Arxa təkərlər (opsiya)",
    # Salon / komfort
    "Бамперы": "Bamperlər",
    "Цветной многофункциональный дисплей": "Rəngli ekran",
    "Проекционный дисплей": "Proyeksion ekran",
    "Кожаная обивка салона": "Dəri salon örtüyü",
    "Декоративная отделка": "Dekorativ bəzək",
    "Спортивные сиденья": "İdman oturacaqları",
    "Регулировка передних сидений": "Ön oturacaq tənzimləməsi",
    "Второй ряд сидений": "İkinci sıra oturacaqlar",
    "Бесключевой доступ": "Açarsız giriş",
    "Система адаптивного освещения дороги (AFS)": "Adaptiv işıqlandırma (AFS)",
    "Автоматическая парковка (IPA)": "Avtopark (IPA)",
    "Камера переднего обзора": "Ön kamera",
    "Камеры бокового обзора": "Yan kameralar",
    "Раздельный климат-контроль": "Ayrı klimat-kontrol",
    "Дополнительное оборудование аудиосистемы": "Audio sistem",
    "Полноцветный ЖК-монитор": "LCD monitor",
    # Ümumi keçidlər
    "Мощность": "Güc",
    "Крутящий момент": "Fırlanma momenti",
    "Объём двигателя": "Mühərrik həcmi",
    "Привод": "Ötürücü",
    "Коробка передач": "Sürətlər qutusu",
    "Длина": "Uzunluq",
    "Ширина": "En",
    "Высота": "Hündürlük",
    "Экран": "Ekran",
}

# Auto-grouping: map spec keys to logical groups
SPEC_AUTO_GROUP = {
    "Komplektasiya": "Ümumi məlumat",
    "Buraxılış dövrü": "Ümumi məlumat",
    "Ötürücü növü": "Ümumi məlumat",
    "Kuzov tipi": "Ümumi məlumat",
    "Transmissiya növü": "Ümumi məlumat",
    "Yığılma ölkəsi": "Ümumi məlumat",
    "Qapı sayı": "Ümumi məlumat",
    "Oturacaq sayı": "Ümumi məlumat",
    "Oturacaq sıra sayı": "Ümumi məlumat",
    "Yanacaq növü": "Ümumi məlumat",
    # Dinamika
    "0-100 km/s, san": "Dinamika",
    "Maks. sürət, km/s": "Dinamika",
    "Klirens, mm": "Dinamika",
    # Ölçülər
    "Ölçülər (U x E x H), mm": "Ölçülər",
    "Təkər bazası, mm": "Ölçülər",
    "Ön təkər izi, mm": "Ölçülər",
    "Arxa təkər izi, mm": "Ölçülər",
    "Ön çıxıntı, mm": "Ölçülər",
    "Arxa çıxıntı, mm": "Ölçülər",
    # Kütlə
    "Kütlə, kq": "Kütlə",
    "Maks. yükqaldırma, kq": "Kütlə",
    "İcazə verilən tam kütlə, kq": "Kütlə",
    "Əyləcsiz qoşqu çəkisi, kq": "Kütlə",
    "Əyləcli qoşqu çəkisi, kq": "Kütlə",
    "Xüsusi kütlə, kq/a.g.": "Kütlə",
    # Baqaj / aero
    "Baqaj həcmi, l": "Ölçülər",
    "Aerodinamik əmsal, cW": "Dinamika",
    # Mühərrik
    "Mühərrik tipi": "Mühərrik",
    "Kompressor": "Mühərrik",
    "Maks. güc, a.g. (kVt)": "Mühərrik",
    "Elektrik yürüş ehtiyatı, km": "Elektrik mühərriki",
    "Elektrik mühərrik gücü, kVt": "Elektrik mühərriki",
    "Elektrik fırlanma momenti, Nm": "Elektrik mühərriki",
    "30 dəq. güc, a.g.": "Elektrik mühərriki",
    "Batareya tutumu, kVt·s": "Elektrik mühərriki",
    # Asqı/əylec
    "Sükan gücləndiricisi": "Asqı və əyləclər",
    "Ön asqı": "Asqı və əyləclər",
    "Arxa asqı": "Asqı və əyləclər",
    "Pnevmatik asqı": "Asqı və əyləclər",
    "Ön əyləclər": "Asqı və əyləclər",
    "Arxa əyləclər": "Asqı və əyləclər",
    "Dayanma əyləci": "Asqı və əyləclər",
    # Təkərlər
    "Ön disklər": "Təkərlər və disklər",
    "Ön disklər (opsiya)": "Təkərlər və disklər",
    "Arxa disklər": "Təkərlər və disklər",
    "Arxa disklər (opsiya)": "Təkərlər və disklər",
    "Ön təkərlər": "Təkərlər və disklər",
    "Ön təkərlər (opsiya)": "Təkərlər və disklər",
    "Arxa təkərlər": "Təkərlər və disklər",
    "Arxa təkərlər (opsiya)": "Təkərlər və disklər",
    # Salon
    "Bamperlər": "Salon və komfort",
    "Rəngli ekran": "Salon və komfort",
    "Proyeksion ekran": "Salon və komfort",
    "Dəri salon örtüyü": "Salon və komfort",
    "Dekorativ bəzək": "Salon və komfort",
    "İdman oturacaqları": "Salon və komfort",
    "Ön oturacaq tənzimləməsi": "Salon və komfort",
    "İkinci sıra oturacaqlar": "Salon və komfort",
    "Açarsız giriş": "Salon və komfort",
    "Adaptiv işıqlandırma (AFS)": "Salon və komfort",
    "Avtopark (IPA)": "Salon və komfort",
    "Ön kamera": "Salon və komfort",
    "Yan kameralar": "Salon və komfort",
    "Ayrı klimat-kontrol": "Salon və komfort",
    "Audio sistem": "Salon və komfort",
    "LCD monitor": "Salon və komfort",
}


def tr_group(name):
    return SPEC_GROUP_MAP.get(name.strip(), name.strip())


def tr_key(key):
    return SPEC_KEY_MAP.get(key.strip(), key.strip())


def auto_group(translated_key, fallback="Ümumi məlumat"):
    """Determine spec group from the translated key name."""
    return SPEC_AUTO_GROUP.get(translated_key, fallback)


def clean_value(val):
    """Remove drom.ru junk from spec values (e.g. 'Отзывы о шинах...', 'Купить шины...')."""
    # Remove "Отзывы о шинах XXX" and "Купить шины XXX"
    val = re.sub(r'Отзывы\s*о\s*шинах[^А-Яа-яA-Za-z0-9]*[\d/\s\w]*', '', val)
    val = re.sub(r'Купить\s*шины[^А-Яа-яA-Za-z0-9]*[\d/\s\w]*', '', val)
    val = re.sub(r'Отзывы.*$', '', val)
    val = re.sub(r'Купить.*$', '', val)
    return val.strip()


# ============ HELPERS ============

def get_headers():
    agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
    ]
    return {
        "User-Agent": random.choice(agents),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ru-RU,ru;q=0.9",
    }


def fetch_page(url, retries=3):
    for attempt in range(retries):
        try:
            time.sleep(random.uniform(1.5, 3.0))
            resp = requests.get(url, headers=get_headers(), timeout=30)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "html.parser")
        except Exception as e:
            log.warning(f"Fetch attempt {attempt+1}/{retries} failed for {url}: {e}")
            if attempt < retries - 1:
                time.sleep(random.uniform(3.0, 6.0))
    log.error(f"All fetch attempts failed for {url}")
    return None


def download_image(url, subdir, filename):
    try:
        save_dir = os.path.join(STORAGE_PATH, subdir)
        os.makedirs(save_dir, exist_ok=True)
        resp = requests.get(url, headers=get_headers(), timeout=30, stream=True)
        resp.raise_for_status()
        ct = resp.headers.get("Content-Type", "")
        if "png" in ct:
            ext = ".png"
        elif "webp" in ct:
            ext = ".webp"
        else:
            ext = ".jpg"
        safe = re.sub(r"[^a-zA-Z0-9_-]", "", filename)[:60]
        final = f"{safe}{ext}"
        path = os.path.join(save_dir, final)
        if os.path.exists(path):
            return f"catalog/{subdir}/{final}"
        with open(path, "wb") as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)
        log.info(f"Image saved: {subdir}/{final}")
        return f"catalog/{subdir}/{final}"
    except Exception as e:
        log.error(f"Image download failed: {url} - {e}")
        return None


def parse_years(text):
    """Parse '06.2022 - н.в.' → (2022, None) or '2018 - 2023' → (2018, 2023)"""
    m = re.search(r'(\d{2}\.\d{4}|\d{4})\s*[-–]\s*(н\.в\.|hal-hazırda|\d{2}\.\d{4}|\d{4})', text)
    if not m:
        return None, None
    ym = re.search(r'(\d{4})', m.group(1))
    year_from = int(ym.group(1)) if ym else None
    to_str = m.group(2)
    if to_str in ("н.в.", "hal-hazırda"):
        year_to = None
    else:
        ym2 = re.search(r'(\d{4})', to_str)
        year_to = int(ym2.group(1)) if ym2 else None
    return year_from, year_to


def make_gen_slug(brand, model, chassis, start_date):
    """e.g. bmw-ix1-u11-022023"""
    parts = [
        brand.lower().strip(),
        re.sub(r"\s+", "-", model.lower().strip()),
    ]
    if chassis:
        parts.append(re.sub(r"\s+", "-", chassis.lower().strip()))
    if start_date:
        parts.append(re.sub(r"[.\s]", "", start_date.lower().strip()))
    return "-".join(p for p in parts if p)


# ============ DATABASE ============

_conn_cache = None

def get_db():
    global _conn_cache
    if _conn_cache is None or _conn_cache.closed:
        _conn_cache = psycopg2.connect(**DB_CONFIG)
    return _conn_cache


def upsert_brand(name, slug=None):
    slug = slug or name.lower().strip()
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO catalog_brands (name, slug, created_at, updated_at)
        VALUES (%s, %s, NOW(), NOW())
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
        RETURNING id
    """, (name, slug))
    bid = cur.fetchone()[0]
    conn.commit()
    cur.close()
    log.info(f"Brand: {name} (id={bid})")
    return bid


def upsert_model(brand_id, name, slug=None, body_type=None, image=None):
    slug = slug or re.sub(r"\s+", "-", name.lower().strip())
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO catalog_models (catalog_brand_id, name, slug, body_type, image, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT (catalog_brand_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            body_type = COALESCE(EXCLUDED.body_type, catalog_models.body_type),
            image = COALESCE(EXCLUDED.image, catalog_models.image),
            updated_at = NOW()
        RETURNING id
    """, (brand_id, name, slug, body_type, image))
    mid = cur.fetchone()[0]
    conn.commit()
    cur.close()
    log.info(f"Model: {name} (id={mid})")
    return mid


def upsert_generation(model_id, name, slug, year_from=None, year_to=None, image=None):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO catalog_generations (catalog_model_id, name, slug, year_from, year_to, image, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            year_from = COALESCE(EXCLUDED.year_from, catalog_generations.year_from),
            year_to = EXCLUDED.year_to,
            image = COALESCE(EXCLUDED.image, catalog_generations.image),
            updated_at = NOW()
        RETURNING id
    """, (model_id, name, slug, year_from, year_to, image))
    gid = cur.fetchone()[0]
    conn.commit()
    cur.close()
    log.info(f"Generation: {name} → slug={slug} (id={gid})")
    return gid


def upsert_spec(gen_id, group_name, spec_key, spec_value, sort_order=0):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO catalog_generation_specs
            (catalog_generation_id, group_name, spec_key, spec_value, sort_order, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT ON CONSTRAINT catalog_generation_specs_gen_group_key
            DO UPDATE SET spec_value = EXCLUDED.spec_value, sort_order = EXCLUDED.sort_order, updated_at = NOW()
    """, (gen_id, group_name, spec_key, spec_value, sort_order))
    conn.commit()
    cur.close()


def insert_image(gen_id, image_path, alt_text, sort_order=0):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM catalog_generation_images WHERE catalog_generation_id=%s AND image=%s",
                (gen_id, image_path))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO catalog_generation_images (catalog_generation_id, image, alt_text, sort_order, created_at, updated_at)
            VALUES (%s, %s, %s, %s, NOW(), NOW())
        """, (gen_id, image_path, alt_text, sort_order))
        conn.commit()
    cur.close()


def add_unique_constraint_if_missing():
    """Add unique constraint for specs upsert if it doesn't exist."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT 1 FROM pg_constraint WHERE conname = 'catalog_generation_specs_gen_group_key'
    """)
    if not cur.fetchone():
        cur.execute("""
            ALTER TABLE catalog_generation_specs
            ADD CONSTRAINT catalog_generation_specs_gen_group_key
            UNIQUE (catalog_generation_id, group_name, spec_key)
        """)
        conn.commit()
        log.info("Added unique constraint on specs table")
    cur.close()


# ============ SCRAPING ============

def scrape_model_page(brand_slug, model_slug):
    """
    Scrape /catalog/bmw/ix1/ → find generation links (g_XXXX_XXXXX)
    Returns list of generation page URLs.
    """
    url = f"{DROM_BASE}/catalog/{brand_slug}/{model_slug}/"
    log.info(f"Scraping model page: {url}")
    soup = fetch_page(url)
    if not soup:
        return []

    # Find generation links: /catalog/bmw/ix1/g_YYYY_NNNNN/
    pattern = re.compile(rf'/catalog/{re.escape(brand_slug)}/{re.escape(model_slug)}/g_\d+_\d+/?')
    gen_urls = []
    seen = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if pattern.search(href):
            full = urljoin(DROM_BASE, href.rstrip("/") + "/")
            if full not in seen:
                seen.add(full)
                gen_urls.append(full)

    log.info(f"Found {len(gen_urls)} generation links")
    return gen_urls


def scrape_generation_page(gen_url):
    """
    Scrape /catalog/bmw/ix1/g_2022_15776/ → get generation info + modification links.
    Returns dict with gen_name, chassis, years, mod_urls, image_urls.
    """
    log.info(f"Scraping generation page: {gen_url}")
    soup = fetch_page(gen_url)
    if not soup:
        return None

    result = {
        "gen_name": "",
        "chassis": "",
        "start_date": "",
        "year_from": None,
        "year_to": None,
        "body_type": None,
        "mod_urls": [],
        "image_urls": [],
    }

    # Parse h1: "BMW iX1 2022, джип/suv 5 дв., 1 поколение, U11 (06.2022 - н.в.) ..."
    h1 = soup.find("h1")
    if h1:
        h1_text = h1.get_text(strip=True)
        log.info(f"H1: {h1_text}")

        # Extract chassis code from H1
        chassis_m = re.search(r',\s*([A-Z][A-Z0-9]+)\s*\(', h1_text)
        if chassis_m:
            result["chassis"] = chassis_m.group(1)

        # Extract years from parentheses
        paren_m = re.search(r'\((\d{2}\.\d{4}\s*[-–]\s*(?:н\.в\.|\d{2}\.\d{4}))\)', h1_text)
        if paren_m:
            date_str = paren_m.group(1)
            result["year_from"], result["year_to"] = parse_years(date_str)
            # Extract start_date (mm.yyyy → mmyyyy)
            sd_m = re.search(r'(\d{2}\.\d{4})', date_str)
            if sd_m:
                result["start_date"] = sd_m.group(1).replace(".", "")

        # Body type from h1
        if "джип" in h1_text.lower() or "suv" in h1_text.lower():
            result["body_type"] = "SUV"
        elif "седан" in h1_text.lower():
            result["body_type"] = "Sedan"
        elif "универсал" in h1_text.lower():
            result["body_type"] = "Wagon"

    # Build generation name: "BMW iX1 (U11) 06.2022 - hal-hazırda"
    # We'll construct it from parsed data later

    # Find modification links: /catalog/brand/model/NUMERIC_ID/
    brand_slug = urlparse(gen_url).path.strip("/").split("/")[1]
    model_slug = urlparse(gen_url).path.strip("/").split("/")[2]
    mod_pattern = re.compile(rf'/catalog/{re.escape(brand_slug)}/{re.escape(model_slug)}/(\d+)/?')
    seen = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if mod_pattern.search(href):
            full = urljoin(DROM_BASE, href.rstrip("/") + "/")
            if full not in seen:
                seen.add(full)
                result["mod_urls"].append(full)

    log.info(f"Found {len(result['mod_urls'])} modification links")

    # Collect gallery images
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        if not src:
            continue
        full_url = urljoin(gen_url, src)
        if "auto.drom.ru" in full_url and any(ext in full_url.lower() for ext in [".jpg", ".jpeg", ".png", ".webp"]):
            if "logo" not in full_url.lower() and "icon" not in full_url.lower():
                result["image_urls"].append(full_url)

    # Also check full-size image links
    for a in soup.find_all("a", href=True):
        href = a["href"]
        full = urljoin(gen_url, href)
        if "auto.drom.ru" in full and any(ext in full.lower() for ext in [".jpg", ".jpeg", ".png", ".webp"]):
            if full not in result["image_urls"]:
                result["image_urls"].append(full)

    # Deduplicate, prefer fullsize over thumbnails
    unique = []
    seen_hashes = set()
    for u in result["image_urls"]:
        h = hashlib.md5(u.encode()).hexdigest()
        if h not in seen_hashes:
            seen_hashes.add(h)
            unique.append(u)
    result["image_urls"] = unique[:30]

    log.info(f"Found {len(result['image_urls'])} images")
    return result


def scrape_modification_specs(mod_url):
    """
    Scrape /catalog/bmw/ix1/434202/ → get ALL specs as list of (group, key, value).
    """
    log.info(f"Scraping specs: {mod_url}")
    soup = fetch_page(mod_url)
    if not soup:
        return []

    specs = []
    sort = 0

    # Strategy 1: table-based specs
    for table in soup.find_all("table"):
        current_group = "Əsas göstəricilər"
        rows = table.find_all("tr")
        for row in rows:
            th = row.find("th")
            tds = row.find_all("td")

            # Group header: th with no td, or th with colspan
            if th and not tds:
                g = th.get_text(strip=True)
                if g and len(g) < 80:
                    current_group = tr_group(g)
                continue

            # Key-value: th + td or td + td
            if th and len(tds) >= 1:
                key = th.get_text(strip=True)
                val = tds[0].get_text(strip=True)
            elif len(tds) >= 2:
                key = tds[0].get_text(strip=True)
                val = tds[1].get_text(strip=True)
            else:
                continue

            if key and val and len(key) < 100:
                sort += 1
                tk = tr_key(key)
                tv = clean_value(val)
                grp = auto_group(tk, current_group)
                if tv:
                    specs.append((grp, tk, tv, sort))

    # Strategy 2: div-based specs (drom uses various layouts)
    if not specs:
        for section in soup.find_all(["div", "section"]):
            cls = " ".join(section.get("class", []))
            if not re.search(r'spec|param|char|tech|feature', cls, re.I):
                continue
            heading = section.find(["h2", "h3", "h4"])
            current_group = tr_group(heading.get_text(strip=True)) if heading else "Ümumi məlumat"
            for row in section.find_all(["div", "li"], recursive=False):
                children = row.find_all(["span", "div", "b", "strong"], recursive=False)
                if len(children) >= 2:
                    key = children[0].get_text(strip=True)
                    val = children[-1].get_text(strip=True)
                    if key and val and key != val and len(key) < 100:
                        sort += 1
                        tk = tr_key(key)
                        tv = clean_value(val)
                        grp = auto_group(tk, current_group)
                        if tv:
                            specs.append((grp, tk, tv, sort))

    # Strategy 3: dl/dt/dd pattern
    if not specs:
        for dl in soup.find_all("dl"):
            prev = dl.find_previous_sibling(["h2", "h3", "h4"])
            current_group = tr_group(prev.get_text(strip=True)) if prev else "Ümumi məlumat"
            dts = dl.find_all("dt")
            dds = dl.find_all("dd")
            for dt, dd in zip(dts, dds):
                key = dt.get_text(strip=True)
                val = dd.get_text(strip=True)
                if key and val:
                    sort += 1
                    tk = tr_key(key)
                    tv = clean_value(val)
                    grp = auto_group(tk, current_group)
                    if tv:
                        specs.append((grp, tk, tv, sort))

    log.info(f"Scraped {len(specs)} specs from {mod_url}")
    return specs


# ============ MAIN PROCESSING ============

def process_model(brand_slug, model_slug, brand_name=None, model_name=None):
    """Main entry: process a single model, scrape all gens + specs."""
    # Use proper English names, falling back to capitalized slug
    brand_name = brand_name or brand_slug.upper()
    model_name = model_name or model_slug.upper()

    log.info(f"Processing: {brand_name} {model_name}")

    # 1. Get generation page URLs from model page
    gen_urls = scrape_model_page(brand_slug, model_slug)
    if not gen_urls:
        log.error(f"No generations found for {brand_name} {model_name}")
        return False

    # DB: upsert brand
    brand_id = upsert_brand(brand_name, brand_slug)

    for gen_url in gen_urls:
        log.info(f"--- Processing generation: {gen_url} ---")

        # 2. Scrape generation page → get info + modification URLs
        gen_data = scrape_generation_page(gen_url)
        if not gen_data:
            continue

        chassis = gen_data["chassis"]
        start_date = gen_data["start_date"]
        year_from = gen_data["year_from"]
        year_to = gen_data["year_to"]
        body_type = gen_data["body_type"]

        # Build generation name
        date_from_str = f"{start_date[:2]}.{start_date[2:]}" if len(start_date) == 6 else str(year_from or "")
        date_to_str = f"{year_to}" if year_to else "hal-hazırda"
        chassis_part = f" ({chassis})" if chassis else ""
        gen_name = f"{brand_name} {model_name}{chassis_part} {date_from_str} - {date_to_str}".strip()

        gen_slug = make_gen_slug(brand_name, model_name, chassis, start_date)
        log.info(f"Generation: {gen_name} → {gen_slug}")

        # Upsert model
        model_id = upsert_model(brand_id, model_name, model_slug, body_type=body_type)

        # Download hero image (first gallery image)
        gen_image_path = None
        subdir = f"{brand_slug}/{model_slug}"
        if gen_data["image_urls"]:
            img_url = gen_data["image_urls"][0]
            img_hash = hashlib.md5(img_url.encode()).hexdigest()[:12]
            gen_image_path = download_image(img_url, subdir, f"hero-{gen_slug}-{img_hash}")
            # Also set as model image
            if gen_image_path:
                upsert_model(brand_id, model_name, model_slug, body_type=body_type, image=gen_image_path)

        # Upsert generation
        gen_id = upsert_generation(model_id, gen_name, gen_slug, year_from, year_to, gen_image_path)

        # 3. Scrape specs from each modification page
        all_specs = []
        for mod_url in gen_data["mod_urls"]:
            specs = scrape_modification_specs(mod_url)
            if specs:
                all_specs = specs  # Use the first modification that returns specs
                break

        if all_specs:
            log.info(f"Inserting {len(all_specs)} specs for {gen_name}")
            for group, key, val, s in all_specs:
                upsert_spec(gen_id, group, key, val, s)
        else:
            log.warning(f"No specs found for {gen_name}")

        # 4. Download and insert gallery images
        for idx, img_url in enumerate(gen_data["image_urls"][:20]):
            img_hash = hashlib.md5(img_url.encode()).hexdigest()[:12]
            saved = download_image(img_url, subdir, f"{gen_slug}-{idx:03d}-{img_hash}")
            if saved:
                alt = f"{brand_name} {model_name} {chassis}"
                insert_image(gen_id, saved, alt, sort_order=idx)

    log.info(f"Finished: {brand_name} {model_name}")
    return True


def process_brand(brand_slug, brand_name=None):
    """Scrape all models for a brand."""
    url = f"{DROM_BASE}/catalog/{brand_slug}/"
    log.info(f"Scraping brand page: {url}")
    soup = fetch_page(url)
    if not soup:
        return False

    # Find model links: /catalog/brand/MODEL/
    pattern = re.compile(rf'/catalog/{re.escape(brand_slug)}/([a-z0-9_-]+)/?$', re.I)
    model_slugs = []
    seen = set()
    skip = {"all", "photos", "reviews", "news", "forum", "specs"}
    for a in soup.find_all("a", href=True):
        m = pattern.search(a["href"])
        if m:
            ms = m.group(1).lower()
            if ms not in seen and ms not in skip:
                seen.add(ms)
                model_slugs.append(ms)

    log.info(f"Found {len(model_slugs)} models for {brand_slug}")
    ok = 0
    for ms in model_slugs:
        try:
            if process_model(brand_slug, ms, brand_name=brand_name):
                ok += 1
        except Exception as e:
            log.error(f"Error processing {brand_slug}/{ms}: {e}")
    return ok > 0


# ============ ENTRY POINT ============

def main():
    parser = argparse.ArgumentParser(description="4WD.az Catalog Scraper")
    parser.add_argument("url", nargs="?", help="drom.ru model URL (e.g. https://www.drom.ru/catalog/bmw/ix1/)")
    parser.add_argument("--brand", help="Scrape all models for brand (e.g. --brand bmw)")
    parser.add_argument("--brand-name", help="Proper brand name (e.g. --brand-name BMW)")
    parser.add_argument("--model-name", help="Proper model name (e.g. --model-name 'iX1')")
    args = parser.parse_args()

    if not args.url and not args.brand:
        parser.print_help()
        sys.exit(1)

    log.info("=" * 60)
    log.info("4WD.az Catalog Scraper started")

    # Ensure DB constraint for spec upserts
    add_unique_constraint_if_missing()

    if args.brand:
        process_brand(args.brand, brand_name=args.brand_name)
    elif args.url:
        # Parse brand/model from URL
        path = urlparse(args.url).path.strip("/").split("/")
        if len(path) >= 3:
            bs, ms = path[1], path[2]
            process_model(bs, ms, brand_name=args.brand_name, model_name=args.model_name)
        else:
            log.error(f"Cannot parse brand/model from URL: {args.url}")
            sys.exit(1)

    log.info("Done")


if __name__ == "__main__":
    main()
