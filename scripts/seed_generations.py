#!/usr/bin/env python3
"""
4WD.az - Seed vehicle generations for offroad models.
Inserts generations into vehicle_generations table on production DB.
"""
import os
import sys
import json
import psycopg2
import re

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "127.0.0.1"),
    "port": int(os.environ.get("DB_PORT", 5432)),
    "dbname": os.environ.get("DB_DATABASE", "fourwd_az"),
    "user": os.environ.get("DB_USERNAME", "fourwd"),
    "password": os.environ.get("DB_PASSWORD", ""),
}

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text)
    return text[:80].strip("-")

# brand_slug -> model_slug -> list of (gen_name, year_from, year_to)
GENERATIONS = {
    "toyota": {
        "land-cruiser": [
            ("300 Series (J300)", 2021, None),
            ("200 Series (J200)", 2007, 2021),
            ("100 Series (J100)", 1998, 2007),
            ("80 Series (J80)", 1990, 1997),
            ("70 Series (J70)", 1984, None),
            ("60 Series (J60)", 1980, 1990),
        ],
        "land-cruiser-prado": [
            ("Prado 150 (J150)", 2009, None),
            ("Prado 120 (J120)", 2002, 2009),
            ("Prado 90 (J90)", 1996, 2002),
        ],
        "hilux": [
            ("AN120/AN130", 2015, None),
            ("AN10/AN20/AN30", 2004, 2015),
            ("N140/N150/N160/N170", 1997, 2005),
        ],
        "4runner": [
            ("N280", 2009, None),
            ("N210", 2002, 2009),
            ("N180", 1995, 2002),
        ],
        "fj-cruiser": [
            ("GSJ15", 2006, 2014),
        ],
        "tacoma": [
            ("N400", 2023, None),
            ("N300", 2015, 2023),
            ("N200", 2004, 2015),
        ],
        "tundra": [
            ("XK70", 2021, None),
            ("XK50", 2006, 2021),
        ],
        "fortuner": [
            ("AN160", 2015, None),
            ("AN50/AN60", 2004, 2015),
        ],
        "sequoia": [
            ("XK80", 2022, None),
            ("XK60", 2007, 2022),
        ],
    },
    "nissan": {
        "patrol": [
            ("Y62", 2010, None),
            ("Y61", 1997, 2010),
            ("Y60", 1987, 1997),
        ],
        "navara": [
            ("D23", 2014, None),
            ("D40", 2004, 2015),
            ("D22", 1997, 2004),
        ],
        "pathfinder": [
            ("R53", 2021, None),
            ("R52", 2012, 2020),
            ("R51", 2004, 2012),
        ],
        "x-terra": [
            ("N50", 2004, 2015),
            ("WD22", 1999, 2004),
        ],
        "x-trail": [
            ("T33", 2021, None),
            ("T32", 2013, 2021),
            ("T31", 2007, 2013),
        ],
    },
    "mitsubishi": {
        "pajero": [
            ("V80/V90", 2006, 2021),
            ("V60/V70", 1999, 2006),
            ("V20/V40", 1991, 1999),
        ],
        "pajero-sport": [
            ("KS1/KS3", 2015, None),
            ("KH0/KG0", 2008, 2016),
            ("K90", 1996, 2008),
        ],
        "l200": [
            ("KL/KK", 2015, None),
            ("KB/KA", 2005, 2015),
        ],
        "outlander": [
            ("GN", 2021, None),
            ("GF/GG", 2012, 2021),
            ("CW", 2006, 2012),
        ],
    },
    "jeep": {
        "wrangler": [
            ("JL", 2017, None),
            ("JK", 2006, 2018),
            ("TJ", 1996, 2006),
        ],
        "gladiator": [
            ("JT", 2019, None),
        ],
        "grand-cherokee": [
            ("WL", 2021, None),
            ("WK2", 2010, 2021),
            ("WK", 2004, 2010),
            ("WJ", 1998, 2004),
        ],
        "cherokee": [
            ("KL", 2013, 2023),
            ("KK", 2007, 2012),
            ("XJ", 1983, 2001),
        ],
    },
    "land-rover": {
        "defender": [
            ("L663", 2019, None),
            ("Classic", 1983, 2016),
        ],
        "discovery": [
            ("L462 (Discovery 5)", 2017, None),
            ("L319 (Discovery 4)", 2009, 2016),
            ("Discovery 3", 2004, 2009),
        ],
        "range-rover": [
            ("L460 (5th gen)", 2022, None),
            ("L405 (4th gen)", 2012, 2022),
            ("L322 (3rd gen)", 2002, 2012),
        ],
        "range-rover-sport": [
            ("L461 (3rd gen)", 2022, None),
            ("L494 (2nd gen)", 2013, 2022),
            ("L320 (1st gen)", 2005, 2013),
        ],
    },
    "suzuki": {
        "jimny": [
            ("JB74", 2018, None),
            ("JB43/JB33", 1998, 2018),
        ],
        "grand-vitara": [
            ("3rd gen", 2022, None),
            ("JT (2nd gen)", 2005, 2015),
            ("FT/GT (1st gen)", 1997, 2005),
        ],
    },
    "ford": {
        "bronco": [
            ("6th gen", 2020, None),
        ],
        "ranger": [
            ("P703 (4th gen)", 2022, None),
            ("P375N (3rd gen)", 2011, 2022),
        ],
        "f-150": [
            ("P702 (14th gen)", 2020, None),
            ("P552 (13th gen)", 2014, 2020),
        ],
        "explorer": [
            ("6th gen", 2019, None),
            ("5th gen", 2010, 2019),
        ],
    },
    "mercedes-benz": {
        "g-class": [
            ("W463A", 2018, None),
            ("W463 (2nd gen)", 1990, 2018),
        ],
    },
    "lexus": {
        "lx": [
            ("LX 600 (J300)", 2021, None),
            ("LX 570 (J200)", 2007, 2021),
            ("LX 470 (J100)", 1998, 2007),
        ],
        "gx": [
            ("GX 550", 2023, None),
            ("GX 460 (J150)", 2009, 2023),
            ("GX 470 (J120)", 2002, 2009),
        ],
    },
    "chevrolet": {
        "tahoe": [
            ("5th gen", 2020, None),
            ("4th gen", 2014, 2020),
            ("3rd gen", 2006, 2014),
        ],
    },
    "hummer": {
        "h1": [
            ("Alpha", 1992, 2006),
        ],
        "h2": [
            ("GMT820", 2002, 2009),
        ],
    },
    "uaz": {
        "patriot": [
            ("Рестайлинг 2", 2014, None),
            ("Рестайлинг", 2012, 2014),
            ("1st gen", 2005, 2012),
        ],
        "hunter": [
            ("315195", 2003, 2024),
        ],
    },
    "lada": {
        "niva": [
            ("2121/21214", 1977, None),
        ],
        "niva-travel": [
            ("21236", 2020, None),
        ],
    },
    "ssangyong": {
        "rexton": [
            ("Y400 (4th gen)", 2017, None),
            ("Y290 (3rd gen)", 2012, 2017),
            ("Y200/Y250 (1st/2nd)", 2001, 2012),
        ],
    },
    "volkswagen": {
        "touareg": [
            ("CR (3rd gen)", 2018, None),
            ("7P (2nd gen)", 2010, 2018),
            ("7L (1st gen)", 2002, 2010),
        ],
        "amarok": [
            ("2H (2nd gen)", 2022, None),
            ("2H (1st gen)", 2010, 2022),
        ],
    },
}


def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    inserted = 0
    skipped = 0

    for brand_slug, models in GENERATIONS.items():
        # Get brand ID
        cur.execute("SELECT id FROM vehicle_brands WHERE slug = %s", (brand_slug,))
        brand_row = cur.fetchone()
        if not brand_row:
            print(f"SKIP brand: {brand_slug}")
            continue
        brand_id = brand_row[0]

        for model_slug, gens in models.items():
            # Get model ID
            cur.execute(
                "SELECT id FROM vehicle_models WHERE vehicle_brand_id = %s AND slug = %s",
                (brand_id, model_slug)
            )
            model_row = cur.fetchone()
            if not model_row:
                print(f"  SKIP model: {brand_slug}/{model_slug}")
                continue
            model_id = model_row[0]

            for gen_name, year_from, year_to in gens:
                gen_slug = slugify(f"{brand_slug}-{model_slug}-{gen_name}")

                cur.execute(
                    "SELECT id FROM vehicle_generations WHERE slug = %s",
                    (gen_slug,)
                )
                if cur.fetchone():
                    skipped += 1
                    continue

                cur.execute("""
                    INSERT INTO vehicle_generations
                        (vehicle_model_id, name, slug, year_from, year_to, is_active, sort_order, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, true, 0, NOW(), NOW())
                    RETURNING id
                """, (model_id, gen_name, gen_slug, year_from, year_to))

                gen_id = cur.fetchone()[0]
                print(f"  INSERT: {brand_slug}/{model_slug}/{gen_name} ({year_from}-{year_to or 'present'}) id={gen_id}")
                inserted += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"\nDone: {inserted} inserted, {skipped} skipped")


if __name__ == "__main__":
    main()
