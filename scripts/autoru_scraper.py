#!/usr/bin/env python3
"""
4WD.az auto.ru Catalog Scraper
Offroad brendlər + modellər + nəsillər + texniki göstəricilər
WebFetch əvəzinə requests+BeautifulSoup istifadə edir (lokal icra üçün)

İstifadə:
  python3 scripts/autoru_scraper.py
"""

import json
import os
import sys
import time
import re
import random
import psycopg2
from pathlib import Path
from datetime import datetime

# DB Config - from env or defaults
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "127.0.0.1"),
    "port": int(os.environ.get("DB_PORT", 5432)),
    "dbname": os.environ.get("DB_DATABASE", "fourwd_az"),
    "user": os.environ.get("DB_USERNAME", "fourwd"),
    "password": os.environ.get("DB_PASSWORD", ""),
}

# ============ OFFROAD MODELS ============
# Brand slug → list of (model_name, autoru_slug) tuples
OFFROAD_MODELS = {
    "toyota": [
        ("Land Cruiser", "land_cruiser"),
        ("Land Cruiser Prado", "land_cruiser_prado"),
        ("Hilux", "hilux"),
        ("4Runner", "4runner"),
        ("FJ Cruiser", "fj_cruiser"),
        ("Tacoma", "tacoma"),
        ("Tundra", "tundra"),
        ("Fortuner", "fortuner"),
        ("Sequoia", "sequoia"),
    ],
    "nissan": [
        ("Patrol", "patrol"),
        ("Navara", "navara"),
        ("Pathfinder", "pathfinder"),
        ("X-Terra", "x_terra"),
        ("X-Trail", "x_trail"),
        ("Terrano", "terrano"),
    ],
    "mitsubishi": [
        ("Pajero", "pajero"),
        ("Pajero Sport", "pajero_sport"),
        ("L200", "l200"),
        ("Outlander", "outlander"),
    ],
    "jeep": [
        ("Wrangler", "wrangler"),
        ("Gladiator", "gladiator"),
        ("Grand Cherokee", "grand_cherokee"),
        ("Cherokee", "cherokee"),
        ("Commander", "commander"),
    ],
    "land-rover": [
        ("Defender", "defender"),
        ("Discovery", "discovery"),
        ("Discovery Sport", "discovery_sport"),
        ("Range Rover", "range_rover"),
        ("Range Rover Sport", "range_rover_sport"),
    ],
    "suzuki": [
        ("Jimny", "jimny"),
        ("Grand Vitara", "grand_vitara"),
        ("Vitara", "vitara"),
    ],
    "ford": [
        ("Bronco", "bronco"),
        ("Ranger", "ranger"),
        ("F-150", "f_150"),
        ("Everest", "everest"),
        ("Explorer", "explorer"),
    ],
    "chevrolet": [
        ("Tahoe", "tahoe"),
        ("Silverado", "silverado"),
        ("Colorado", "colorado"),
        ("TrailBlazer", "trailblazer"),
        ("Suburban", "suburban"),
        ("Niva", "chevrolet_niva"),
    ],
    "dodge": [
        ("Ram", "ram"),
        ("Durango", "durango"),
    ],
    "gmc": [
        ("Sierra", "sierra"),
        ("Yukon", "yukon"),
        ("Canyon", "canyon"),
    ],
    "mercedes-benz": [
        ("G-Class", "g_klasse"),
        ("GLE", "gle_klasse"),
        ("GLS", "gls_klasse"),
        ("GL", "gl_klasse"),
    ],
    "bmw": [
        ("X3", "x3"),
        ("X5", "x5"),
        ("X7", "x7"),
    ],
    "volkswagen": [
        ("Touareg", "touareg"),
        ("Amarok", "amarok"),
    ],
    "isuzu": [
        ("D-Max", "d_max"),
        ("MU-X", "mu_x"),
    ],
    "mazda": [
        ("CX-5", "cx_5"),
        ("CX-9", "cx_9"),
        ("BT-50", "bt_50"),
    ],
    "subaru": [
        ("Forester", "forester"),
        ("Outback", "outback"),
        ("XV", "xv"),
    ],
    "lexus": [
        ("LX", "lx"),
        ("GX", "gx"),
    ],
    "infiniti": [
        ("QX80", "qx80"),
        ("QX60", "qx60"),
    ],
    "hyundai": [
        ("Santa Fe", "santa_fe"),
        ("Tucson", "tucson"),
        ("Palisade", "palisade"),
    ],
    "kia": [
        ("Sorento", "sorento"),
        ("Sportage", "sportage"),
        ("Mohave", "mohave"),
    ],
    "ssangyong": [
        ("Rexton", "rexton"),
        ("Musso", "musso"),
        ("Kyron", "kyron"),
        ("Korando", "korando"),
        ("Actyon Sports", "actyon_sports"),
    ],
    "great-wall": [
        ("Wingle", "wingle"),
        ("Hover", "hover"),
        ("Poer", "poer"),
    ],
    "mahindra": [
        ("Thar", "thar"),
        ("Scorpio", "scorpio"),
    ],
    "lada": [
        ("Niva", "4x4"),
        ("Niva Travel", "niva_travel"),
    ],
    "hummer": [
        ("H1", "h1"),
        ("H2", "h2"),
        ("H3", "h3"),
    ],
    "uaz": [
        ("Patriot", "patriot"),
        ("Hunter", "hunter"),
        ("3151", "3151"),
        ("Pickup", "pickup"),
    ],
    "byd": [
        ("Tang", "tang"),
    ],
    "rivian": [
        ("R1T", "r1t"),
        ("R1S", "r1s"),
    ],
    "tesla": [
        ("Model X", "model_x"),
        ("Cybertruck", "cybertruck"),
    ],
    "tata": [
        ("Safari", "safari"),
    ],
}

# ============ OUTPUT ============
OUTPUT_FILE = Path(__file__).parent / "catalog_data.json"


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text)
    return text[:80].strip("-")


def build_catalog_structure():
    """Build the basic catalog structure from our known offroad models."""
    catalog = []

    for brand_slug, models in OFFROAD_MODELS.items():
        brand_data = {
            "brand_slug": brand_slug,
            "models": []
        }

        for model_name, autoru_slug in models:
            model_slug = slugify(model_name)
            brand_data["models"].append({
                "name": model_name,
                "slug": model_slug,
                "autoru_slug": autoru_slug,
                "generations": [],  # will be populated by scraper
            })

        catalog.append(brand_data)

    return catalog


def get_db():
    return psycopg2.connect(**DB_CONFIG)


def insert_models_to_db(catalog):
    """Insert models into vehicle_models table."""
    conn = get_db()
    cur = conn.cursor()

    inserted = 0
    for brand_data in catalog:
        brand_slug = brand_data["brand_slug"]

        # Get brand ID
        cur.execute("SELECT id FROM vehicle_brands WHERE slug = %s", (brand_slug,))
        row = cur.fetchone()
        if not row:
            print(f"  SKIP brand: {brand_slug} (not in DB)")
            continue
        brand_id = row[0]

        for model in brand_data["models"]:
            cur.execute("""
                INSERT INTO vehicle_models (vehicle_brand_id, name, slug, year_from, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, 0, true, NOW(), NOW())
                ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
                RETURNING id
            """, (brand_id, model["name"], model["slug"]))
            model_id = cur.fetchone()[0]
            print(f"  INSERT: {brand_slug}/{model['name']} (id={model_id})")
            inserted += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"\nInserted {inserted} models")


def main():
    print("=" * 60)
    print("4WD.az Catalog - Insert offroad models")
    print("=" * 60)

    # Count total models
    total = sum(len(models) for models in OFFROAD_MODELS.values())
    print(f"Total: {len(OFFROAD_MODELS)} brands, {total} models")

    catalog = build_catalog_structure()

    # Save to JSON for reference
    with open(OUTPUT_FILE, "w") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    print(f"Saved catalog structure to {OUTPUT_FILE}")

    # Insert into DB
    print("\nInserting models into DB...")
    insert_models_to_db(catalog)

    print("\nDone!")


if __name__ == "__main__":
    main()
