#!/usr/bin/env python3
"""
Fetch generation images from Wikipedia API and upload to server.
"""
import os
import re
import time
import requests
import psycopg2

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "127.0.0.1"),
    "port": int(os.environ.get("DB_PORT", 5432)),
    "dbname": os.environ.get("DB_DATABASE", "fourwd_az"),
    "user": os.environ.get("DB_USERNAME", "fourwd"),
    "password": os.environ.get("DB_PASSWORD", ""),
}

DEST = os.environ.get("IMG_DEST", "/tmp/gen-images")
WIKI_API = "https://en.wikipedia.org/w/api.php"
UA = "CarCatalog/1.0 (https://4wd.az; admin@4wd.az)"

# brand_slug/model_slug/gen_slug → Wikipedia search title
# We map each generation to a Wikipedia article title that has a good car photo
WIKI_TITLES = {
    # Toyota Land Cruiser
    "toyota-land-cruiser-300-series-j300": "Toyota Land Cruiser (J300)",
    "toyota-land-cruiser-200-series-j200": "Toyota Land Cruiser (J200)",
    "toyota-land-cruiser-100-series-j100": "Toyota Land Cruiser (J100)",
    "toyota-land-cruiser-80-series-j80": "Toyota Land Cruiser (J80)",
    "toyota-land-cruiser-70-series-j70": "Toyota Land Cruiser (J70)",
    "toyota-land-cruiser-60-series-j60": "Toyota Land Cruiser (J60)",
    # Toyota Land Cruiser Prado
    "toyota-land-cruiser-prado-prado-150-j150": "Toyota Land Cruiser Prado",
    "toyota-land-cruiser-prado-prado-120-j120": "Toyota Land Cruiser Prado",
    "toyota-land-cruiser-prado-prado-90-j90": "Toyota Land Cruiser Prado",
    # Toyota Hilux
    "toyota-hilux-an120an130": "Toyota Hilux",
    "toyota-hilux-an10an20an30": "Toyota Hilux",
    "toyota-hilux-n140n150n160n170": "Toyota Hilux",
    # Toyota 4Runner
    "toyota-4runner-n280": "Toyota 4Runner",
    "toyota-4runner-n210": "Toyota 4Runner",
    "toyota-4runner-n180": "Toyota 4Runner",
    # Toyota FJ Cruiser
    "toyota-fj-cruiser-gsj15": "Toyota FJ Cruiser",
    # Toyota Tacoma
    "toyota-tacoma-n400": "Toyota Tacoma",
    "toyota-tacoma-n300": "Toyota Tacoma",
    "toyota-tacoma-n200": "Toyota Tacoma",
    # Toyota Tundra
    "toyota-tundra-xk70": "Toyota Tundra",
    "toyota-tundra-xk50": "Toyota Tundra",
    # Toyota Fortuner
    "toyota-fortuner-an160": "Toyota Fortuner",
    "toyota-fortuner-an50an60": "Toyota Fortuner",
    # Toyota Sequoia
    "toyota-sequoia-xk80": "Toyota Sequoia",
    "toyota-sequoia-xk60": "Toyota Sequoia",
    # Nissan Patrol
    "nissan-patrol-y62": "Nissan Patrol",
    "nissan-patrol-y61": "Nissan Patrol Y61",
    "nissan-patrol-y60": "Nissan Patrol",
    # Nissan Navara
    "nissan-navara-d23": "Nissan Navara",
    "nissan-navara-d40": "Nissan Navara",
    "nissan-navara-d22": "Nissan Navara",
    # Nissan Pathfinder
    "nissan-pathfinder-r53": "Nissan Pathfinder",
    "nissan-pathfinder-r52": "Nissan Pathfinder",
    "nissan-pathfinder-r51": "Nissan Pathfinder",
    # Nissan X-Terra
    "nissan-x-terra-n50": "Nissan Xterra",
    "nissan-x-terra-wd22": "Nissan Xterra",
    # Nissan X-Trail
    "nissan-x-trail-t33": "Nissan X-Trail",
    "nissan-x-trail-t32": "Nissan X-Trail",
    "nissan-x-trail-t31": "Nissan X-Trail",
    # Mitsubishi Pajero
    "mitsubishi-pajero-v80v90": "Mitsubishi Pajero",
    "mitsubishi-pajero-v60v70": "Mitsubishi Pajero",
    "mitsubishi-pajero-v20v40": "Mitsubishi Pajero",
    # Mitsubishi Pajero Sport
    "mitsubishi-pajero-sport-ks1ks3": "Mitsubishi Pajero Sport",
    "mitsubishi-pajero-sport-kh0kg0": "Mitsubishi Pajero Sport",
    "mitsubishi-pajero-sport-k90": "Mitsubishi Pajero Sport",
    # Mitsubishi L200
    "mitsubishi-l200-klkk": "Mitsubishi Triton",
    "mitsubishi-l200-kbka": "Mitsubishi Triton",
    # Mitsubishi Outlander
    "mitsubishi-outlander-gn": "Mitsubishi Outlander",
    "mitsubishi-outlander-gfgg": "Mitsubishi Outlander",
    "mitsubishi-outlander-cw": "Mitsubishi Outlander",
    # Jeep Wrangler
    "jeep-wrangler-jl": "Jeep Wrangler (JL)",
    "jeep-wrangler-jk": "Jeep Wrangler (JK)",
    "jeep-wrangler-tj": "Jeep Wrangler (TJ)",
    # Jeep Gladiator
    "jeep-gladiator-jt": "Jeep Gladiator (JT)",
    # Jeep Grand Cherokee
    "jeep-grand-cherokee-wl": "Jeep Grand Cherokee (WL)",
    "jeep-grand-cherokee-wk2": "Jeep Grand Cherokee (WK2)",
    "jeep-grand-cherokee-wk": "Jeep Grand Cherokee (WK)",
    "jeep-grand-cherokee-wj": "Jeep Grand Cherokee (WJ)",
    # Jeep Cherokee
    "jeep-cherokee-kl": "Jeep Cherokee (KL)",
    "jeep-cherokee-kk": "Jeep Liberty (KK)",
    "jeep-cherokee-xj": "Jeep Cherokee (XJ)",
    # Land Rover Defender
    "land-rover-defender-l663": "Land Rover Defender",
    "land-rover-defender-classic": "Land Rover Defender",
    # Land Rover Discovery
    "land-rover-discovery-l462-discovery-5": "Land Rover Discovery",
    "land-rover-discovery-l319-discovery-4": "Land Rover Discovery",
    "land-rover-discovery-discovery-3": "Land Rover Discovery 3",
    # Land Rover Range Rover
    "land-rover-range-rover-l460-5th-gen": "Range Rover",
    "land-rover-range-rover-l405-4th-gen": "Range Rover",
    "land-rover-range-rover-l322-3rd-gen": "Range Rover",
    # Land Rover Range Rover Sport
    "land-rover-range-rover-sport-l461-3rd-gen": "Range Rover Sport",
    "land-rover-range-rover-sport-l494-2nd-gen": "Range Rover Sport",
    "land-rover-range-rover-sport-l320-1st-gen": "Range Rover Sport",
    # Suzuki Jimny
    "suzuki-jimny-jb74": "Suzuki Jimny",
    "suzuki-jimny-jb43jb33": "Suzuki Jimny",
    # Suzuki Grand Vitara
    "suzuki-grand-vitara-3rd-gen": "Suzuki Grand Vitara",
    "suzuki-grand-vitara-jt-2nd-gen": "Suzuki Grand Vitara",
    "suzuki-grand-vitara-ftgt-1st-gen": "Suzuki Grand Vitara",
    # Ford Bronco
    "ford-bronco-6th-gen": "Ford Bronco (sixth generation)",
    # Ford Ranger
    "ford-ranger-p703-4th-gen": "Ford Ranger",
    "ford-ranger-p375n-3rd-gen": "Ford Ranger",
    # Ford F-150
    "ford-f-150-p702-14th-gen": "Ford F-Series",
    "ford-f-150-p552-13th-gen": "Ford F-Series",
    # Ford Explorer
    "ford-explorer-6th-gen": "Ford Explorer",
    "ford-explorer-5th-gen": "Ford Explorer",
    # Mercedes G-Class
    "mercedes-benz-g-class-w463a": "Mercedes-Benz G-Class",
    "mercedes-benz-g-class-w463-2nd-gen": "Mercedes-Benz G-Class",
    # Lexus LX
    "lexus-lx-lx-600-j300": "Lexus LX",
    "lexus-lx-lx-570-j200": "Lexus LX",
    "lexus-lx-lx-470-j100": "Lexus LX",
    # Lexus GX
    "lexus-gx-gx-550": "Lexus GX",
    "lexus-gx-gx-460-j150": "Lexus GX",
    "lexus-gx-gx-470-j120": "Lexus GX",
    # Chevrolet Tahoe
    "chevrolet-tahoe-5th-gen": "Chevrolet Tahoe",
    "chevrolet-tahoe-4th-gen": "Chevrolet Tahoe",
    "chevrolet-tahoe-3rd-gen": "Chevrolet Tahoe",
    # Hummer
    "hummer-h1-alpha": "Hummer H1",
    "hummer-h2-gmt820": "Hummer H2",
    # UAZ
    "uaz-patriot-2-2": "UAZ Patriot",
    "uaz-patriot-": "UAZ Patriot",
    "uaz-patriot-1st-gen": "UAZ Patriot",
    "uaz-hunter-315195": "UAZ-469",
    # Lada
    "lada-niva-212121214": "Lada Niva",
    "lada-niva-travel-21236": "Lada Niva Travel",
    # SsangYong Rexton
    "ssangyong-rexton-y400-4th-gen": "SsangYong Rexton",
    "ssangyong-rexton-y290-3rd-gen": "SsangYong Rexton",
    "ssangyong-rexton-y200y250-1st2nd": "SsangYong Rexton",
    # VW Touareg
    "volkswagen-touareg-cr-3rd-gen": "Volkswagen Touareg",
    "volkswagen-touareg-7p-2nd-gen": "Volkswagen Touareg",
    "volkswagen-touareg-7l-1st-gen": "Volkswagen Touareg",
    # VW Amarok
    "volkswagen-amarok-2h-2nd-gen": "Volkswagen Amarok",
    "volkswagen-amarok-2h-1st-gen": "Volkswagen Amarok",
}


def get_wiki_image(title, size=600):
    """Get thumbnail URL from Wikipedia API."""
    params = {
        "action": "query",
        "titles": title,
        "prop": "pageimages",
        "pithumbsize": size,
        "format": "json",
    }
    try:
        resp = requests.get(WIKI_API, params=params, headers={"User-Agent": UA}, timeout=10)
        pages = resp.json()["query"]["pages"]
        for pid, page in pages.items():
            thumb = page.get("thumbnail", {}).get("source")
            if thumb:
                return thumb
    except Exception as e:
        print(f"  Wiki API error for '{title}': {e}")
    return None


def download_image(url, filepath):
    """Download image file."""
    try:
        resp = requests.get(url, headers={"User-Agent": UA}, timeout=15, stream=True)
        resp.raise_for_status()
        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"  Download error: {e}")
        return False


def main():
    os.makedirs(DEST, exist_ok=True)

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    # Get all generations without images
    cur.execute("""
        SELECT vg.id, vg.slug, vg.name, vg.image,
               vm.name as model_name, vm.slug as model_slug,
               vb.name as brand_name, vb.slug as brand_slug
        FROM vehicle_generations vg
        JOIN vehicle_models vm ON vm.id = vg.vehicle_model_id
        JOIN vehicle_brands vb ON vb.id = vm.vehicle_brand_id
        ORDER BY vb.name, vm.name, vg.year_from DESC
    """)
    rows = cur.fetchall()
    print(f"Total generations: {len(rows)}")

    downloaded = 0
    skipped = 0
    failed = 0

    for gen_id, gen_slug, gen_name, current_image, model_name, model_slug, brand_name, brand_slug in rows:
        if current_image:
            skipped += 1
            continue

        wiki_title = WIKI_TITLES.get(gen_slug)
        if not wiki_title:
            # Fallback: try "Brand Model"
            wiki_title = f"{brand_name} {model_name}"

        print(f"[{gen_id}] {brand_name} {model_name} {gen_name} → wiki:'{wiki_title}'")

        img_url = get_wiki_image(wiki_title)
        if not img_url:
            # Try simpler title
            img_url = get_wiki_image(f"{brand_name} {model_name}")
        if not img_url:
            print(f"  NO IMAGE FOUND")
            failed += 1
            continue

        # Download locally
        ext = ".jpg" if ".jpg" in img_url.lower() or ".jpeg" in img_url.lower() else ".png"
        filename = f"{gen_slug}{ext}"
        local_path = os.path.join(DEST, filename)

        if download_image(img_url, local_path):
            storage_path = f"generations/{filename}"
            cur.execute(
                "UPDATE vehicle_generations SET image = %s, updated_at = NOW() WHERE id = %s",
                (storage_path, gen_id)
            )
            conn.commit()
            print(f"  OK → {storage_path}")
            downloaded += 1
        else:
            failed += 1

        time.sleep(0.5)  # be polite

    cur.close()
    conn.close()
    print(f"\nDone: {downloaded} downloaded, {skipped} had image, {failed} failed")
    print(f"Images saved to: {DEST}")
    print(f"Upload to server: scp {DEST}/* vultr:/var/www/4wd.az/backend/storage/app/public/generations/")


if __name__ == "__main__":
    main()
