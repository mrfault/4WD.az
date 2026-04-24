#!/usr/bin/env python3
"""
4WD.az - Rivian full catalog seeder.
Seeds all Rivian models, generations, and specs with ALL modifications from auto.ru.
Usage: python3 scripts/seed_rivian_catalog.py
"""
import os, sys, json, re, copy, psycopg2

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "127.0.0.1"),
    "port": int(os.environ.get("DB_PORT", 5432)),
    "dbname": os.environ.get("DB_DATABASE", "fourwd_az"),
    "user": os.environ.get("DB_USERNAME", "fourwd"),
    "password": os.environ.get("DB_PASSWORD", ""),
}

GROUP_TR = {
    "Общая информация": "Ümumi məlumat",
    "Размеры": "Ölçülər",
    "Объём и масса": "Həcm və kütlə",
    "Двигатель": "Mühərrik",
    "Трансмиссия": "Transmissiya",
    "Эксплуатационные показатели": "Performans",
    "Подвеска и тормоза": "Asqı və əyləclər",
}

KEY_TR = {
    "Страна марки": "Ölkə", "Класс автомобиля": "Avtomobil sinfi",
    "Количество дверей": "Qapı sayı", "Количество мест": "Oturacaq sayı",
    "Расположение руля": "Sükan mövqeyi", "Длина": "Uzunluq", "Ширина": "En",
    "Высота": "Hündürlük", "Колёсная база": "Təkər bazası", "Клиренс": "Klirens",
    "Ширина передней колеи": "Ön təkər izi", "Ширина задней колеи": "Arxa təkər izi",
    "Размер колёс": "Təkər ölçüsü", "Объём багажника": "Baqaj həcmi",
    "Объём топливного бака": "Yanacaq çəni", "Снаряженная масса": "Öz kütləsi",
    "Полная масса": "Tam kütlə", "Тип двигателя": "Mühərrik tipi",
    "Расположение двигателя": "Mühərrik yeri", "Объём двигателя": "Mühərrik həcmi",
    "Наддув": "Nasos", "Максимальная мощность": "Maksimum güc",
    "Максимальный крутящий момент": "Maks. fırlanma momenti",
    "Конфигурация": "Konfiqurasiya", "Количество цилиндров": "Silindr sayı",
    "Количество клапанов на цилиндр": "Silindrə klapan",
    "Система питания": "Yanacaq sistemi", "Степень сжатия": "Sıxılma dərəcəsi",
    "Диаметр цилиндра и ход поршня": "Silindr diametri / porşen gedişi",
    "Код двигателя": "Mühərrik kodu", "ГРМ": "Qaz paylama mexanizmi",
    "Коробка передач": "Sürətlər qutusu", "Количество передач": "Sürət sayı",
    "Тип привода": "Ötürücü tipi", "Максимальная скорость": "Maks. sürət",
    "Разгон до 100 км/ч": "0-100 km/s", "Расход топлива": "Yanacaq sərfiyyatı",
    "Марка топлива": "Yanacaq markası", "Тип передней подвески": "Ön asqı",
    "Тип задней подвески": "Arxa asqı", "Передние тормоза": "Ön əyləclər",
    "Задние тормоза": "Arxa əyləclər", "Экологический стандарт": "Ekoloji standart",
    "Выброс CO2": "CO2 emissiyası",
    "Левый": "Sol", "Правый": "Sağ", "Левый, Правый": "Sol, Sağ",
    "Бензин": "Benzin", "Бензиновый": "Benzin", "Дизель": "Dizel",
    "Дизельный": "Dizel", "Гибридный": "Hibrid", "Электро": "Elektrik",
    "Автомат": "Avtomat", "Механика": "Mexaniki", "Вариатор": "Variator",
    "Робот": "Robot", "Полный": "Tam", "Передний": "Ön", "Задний": "Arxa",
    "Независимая, пружинная": "Müstəqil, yaylı",
    "Зависимая, рессорная": "Asılı, ressorlu",
    "Зависимая, пружинная": "Asılı, yaylı",
    "Зависимая, листовая": "Asılı, yarpaq ressorlu",
    "Независимая, торсионная": "Müstəqil, torsion",
    "Дисковые вентилируемые": "Diskli ventilyasiyalı",
    "Дисковые": "Diskli", "Барабанные": "Baraban",
    "США": "ABŞ", "Нет": "Yox", "Турбонаддув": "Turbo", "Турбо": "Turbo",
    "Передний, продольное": "Ön, uzununa", "Передний, поперечное": "Ön, eninə",
    "Прямой впрыск": "Birbaşa enjeksiyon",
    "Распределённый впрыск": "Paylanmış enjeksiyon",
    "Непосредственный впрыск": "Birbaşa enjeksiyon",
    "Common Rail": "Common Rail", "Рядный": "Sıralı", "V-образный": "V-şəkilli",
}

def tr(text):
    return KEY_TR.get(text.strip(), text.strip())

def tr_group(text):
    return GROUP_TR.get(text.strip(), text.strip())

_UNIT_REPLACEMENTS = [
    ("л/100км","l/100km"),("л/100 км","l/100km"),("км/ч","km/saat"),
    ("об/мин","d/d"),("л.с.","a.g."),("см³","sm³"),("мм","mm"),
    ("кг","kq"),("Нм","Nm"),("кВт","kVt"),("г/км","q/km"),
    ("АИ-","AI-"),("Евро ","Avro "),(" при "," @ "),(" л"," l"),
]

def tr_val(text):
    t = tr(text)
    for ru, az in _UNIT_REPLACEMENTS:
        t = t.replace(ru, az)
    return t

def make_specs(raw):
    result, sort = [], 0
    for group_name, items in raw.items():
        sort += 1
        result.append({"label": tr_group(group_name), "sort_order": sort,
                        "items": [{"key": tr(k), "value": tr_val(v)} for k, v in items]})
    return result

def make_modification_specs(modifications):
    return {"modifications": [{"name": n, "groups": make_specs(r)} for n, r in modifications]}

def get_db():
    return psycopg2.connect(**DB_CONFIG)

def _mt(spec, gears=6):
    n = {}
    for g, items in spec.items():
        n[g] = [(k, "Механика" if k == "Коробка передач" else str(gears) if k == "Количество передач" else v) for k, v in items]
    return n

def _drive(spec, drv="Передний"):
    n = {}
    for g, items in spec.items():
        n[g] = [(k, drv if k == "Тип привода" else v) for k, v in items]
    return n

def _set_engine(spec, **kw):
    MAP = {"power": "Максимальная мощность", "torque": "Максимальный крутящий момент",
           "displacement": "Объём двигателя", "turbo": "Наддув", "fuel_type": "Тип двигателя",
           "config": "Конфигурация", "cylinders": "Количество цилиндров",
           "valves": "Количество клапанов на цилиндр", "code": "Код двигателя", "grm": "ГРМ",
           "gearbox": "Коробка передач", "gears": "Количество передач", "drive": "Тип привода",
           "accel": "Разгон до 100 км/ч", "top_speed": "Максимальная скорость",
           "fuel_cons": "Расход топлива", "fuel_brand": "Марка топлива",
           "weight": "Снаряженная масса", "gross_weight": "Полная масса",
           "fuel_system": "Система питания", "compression": "Степень сжатия",
           "bore_stroke": "Диаметр цилиндра и ход поршня", "trunk": "Объём багажника",
           "tank": "Объём топливного бака", "eco": "Экологический стандарт",
           "co2": "Выброс CO2"}
    n = {}
    for g, items in spec.items():
        new_items = []
        for k, v in items:
            replaced = False
            for param, ru_key in MAP.items():
                if k == ru_key and param in kw:
                    new_items.append((k, kw[param]))
                    replaced = True
                    break
            if not replaced:
                new_items.append((k, v))
        n[g] = new_items
    return n


REQUIRED_MODELS = {
    "r1t": "R1T",
    "r1s": "R1S",
    "r2": "R2",
}

GENERATIONS = {
    "r1t": [("I", "rivian-r1t-i", 2021, None)],
    "r1s": [("I", "rivian-r1s-i", 2022, None)],
    "r2": [("I", "rivian-r2-i", 2026, None)],
}

OLD_MODEL_SLUGS = []
OLD_GENERATION_SLUGS = []

# --- R1T I (2021+) ---
_r1t_dm = {
    "Общая информация": [("Страна марки","США"),("Класс автомобиля","J"),("Количество дверей","4"),("Количество мест","5"),("Расположение руля","Левый")],
    "Размеры": [("Длина","5514 мм"),("Ширина","2078 мм"),("Высота","1986 мм"),("Колёсная база","3449 мм"),("Клиренс","201-366 мм"),("Ширина передней колеи","1715 мм"),("Ширина задней колеи","1715 мм"),("Размер колёс","275/65 R20")],
    "Объём и масса": [("Объём багажника","314 л (передний)"),("Объём топливного бака","\u2014"),("Снаряженная масса","3242 кг"),("Полная масса","3950 кг")],
    "Двигатель": [("Тип двигателя","Электро"),("Объём двигателя","\u2014"),("Наддув","Нет"),("Максимальная мощность","533 л.с."),("Максимальный крутящий момент","827 Нм"),("Конфигурация","\u2014"),("Количество цилиндров","\u2014"),("Количество клапанов на цилиндр","\u2014"),("Система питания","\u2014"),("Степень сжатия","\u2014"),("Диаметр цилиндра и ход поршня","\u2014"),("Код двигателя","Dual Motor"),("ГРМ","\u2014")],
    "Трансмиссия": [("Коробка передач","Автомат"),("Количество передач","1"),("Тип привода","Полный")],
    "Эксплуатационные показатели": [("Максимальная скорость","201 км/ч"),("Разгон до 100 км/ч","4.5 с"),("Расход топлива","\u2014"),("Марка топлива","\u2014"),("Выброс CO2","0 г/км")],
    "Подвеска и тормоза": [("Тип передней подвески","Независимая, пружинная"),("Тип задней подвески","Независимая, пружинная"),("Передние тормоза","Дисковые вентилируемые"),("Задние тормоза","Дисковые вентилируемые")],
}
_r1t_pdm = _set_engine(_r1t_dm, power="665 л.с.", torque="1124 Нм", code="Performance Dual Motor", accel="3.5 с")
_r1t_qm = _set_engine(_r1t_dm, power="835 л.с.", torque="1231 Нм", code="Quad Motor", accel="3.0 с", weight="2670 кг")

# --- R1S I (2022+) ---
_r1s_dm = {
    "Общая информация": [("Страна марки","США"),("Класс автомобиля","J"),("Количество дверей","5"),("Количество мест","7"),("Расположение руля","Левый")],
    "Размеры": [("Длина","5100 мм"),("Ширина","2078 мм"),("Высота","1963 мм"),("Колёсная база","3076 мм"),("Клиренс","205-378 мм"),("Ширина передней колеи","1715 мм"),("Ширина задней колеи","1715 мм"),("Размер колёс","275/65 R20")],
    "Объём и масса": [("Объём багажника","144 / 2973 л"),("Объём топливного бака","\u2014"),("Снаряженная масса","3242 кг"),("Полная масса","3950 кг")],
    "Двигатель": [("Тип двигателя","Электро"),("Объём двигателя","\u2014"),("Наддув","Нет"),("Максимальная мощность","533 л.с."),("Максимальный крутящий момент","827 Нм"),("Конфигурация","\u2014"),("Количество цилиндров","\u2014"),("Количество клапанов на цилиндр","\u2014"),("Система питания","\u2014"),("Степень сжатия","\u2014"),("Диаметр цилиндра и ход поршня","\u2014"),("Код двигателя","Dual Motor"),("ГРМ","\u2014")],
    "Трансмиссия": [("Коробка передач","Автомат"),("Количество передач","1"),("Тип привода","Полный")],
    "Эксплуатационные показатели": [("Максимальная скорость","201 км/ч"),("Разгон до 100 км/ч","4.5 с"),("Расход топлива","\u2014"),("Марка топлива","\u2014"),("Выброс CO2","0 г/км")],
    "Подвеска и тормоза": [("Тип передней подвески","Независимая, пружинная"),("Тип задней подвески","Независимая, пружинная"),("Передние тормоза","Дисковые вентилируемые"),("Задние тормоза","Дисковые вентилируемые")],
}
_r1s_pdm = _set_engine(_r1s_dm, power="665 л.с.", torque="1124 Нм", code="Performance Dual Motor", accel="3.5 с")
_r1s_qm = _set_engine(_r1s_dm, power="835 л.с.", torque="1231 Нм", code="Quad Motor", accel="3.0 с", weight="2780 кг")

# --- R2 I (2026+) ---
_r2_dm = {
    "Общая информация": [("Страна марки","США"),("Класс автомобиля","D"),("Количество дверей","5"),("Количество мест","5"),("Расположение руля","Левый")],
    "Размеры": [("Длина","4720 мм"),("Ширина","1990 мм"),("Высота","1694 мм"),("Колёсная база","2930 мм"),("Клиренс","210 мм"),("Ширина передней колеи","1680 мм"),("Ширина задней колеи","1680 мм"),("Размер колёс","255/55 R20")],
    "Объём и масса": [("Объём багажника","340 / 1050 л"),("Объём топливного бака","\u2014"),("Снаряженная масса","2200 кг"),("Полная масса","2750 кг")],
    "Двигатель": [("Тип двигателя","Электро"),("Объём двигателя","\u2014"),("Наддув","Нет"),("Максимальная мощность","300 л.с."),("Максимальный крутящий момент","450 Нм"),("Конфигурация","\u2014"),("Количество цилиндров","\u2014"),("Количество клапанов на цилиндр","\u2014"),("Система питания","\u2014"),("Степень сжатия","\u2014"),("Диаметр цилиндра и ход поршня","\u2014"),("Код двигателя","Dual Motor"),("ГРМ","\u2014")],
    "Трансмиссия": [("Коробка передач","Автомат"),("Количество передач","1"),("Тип привода","Полный")],
    "Эксплуатационные показатели": [("Максимальная скорость","201 км/ч"),("Разгон до 100 км/ч","5.0 с"),("Расход топлива","\u2014"),("Марка топлива","\u2014"),("Выброс CO2","0 г/км")],
    "Подвеска и тормоза": [("Тип передней подвески","Независимая, пружинная"),("Тип задней подвески","Независимая, пружинная"),("Передние тормоза","Дисковые вентилируемые"),("Задние тормоза","Дисковые вентилируемые")],
}
_r2_sm = _set_engine(_r2_dm, power="225 л.с.", torque="310 Нм", code="Single Motor", drive="Задний", accel="6.0 с")

SPECS_DATA = {
    "rivian-r1t-i": [
        ("397.0 kW AT 4WD - DM Standard", _r1t_dm),
        ("397.0 kW AT 4WD - DM Large", _r1t_dm),
        ("397.0 kW AT 4WD - DM Max", _r1t_dm),
        ("496.0 kW AT 4WD - PDM Large", _r1t_pdm),
        ("496.0 kW AT 4WD - PDM Max", _r1t_pdm),
        ("623.0 kW AT 4WD - QM Large", _r1t_qm),
    ],
    "rivian-r1s-i": [
        ("397.0 kW AT 4WD - DM Standard", _r1s_dm),
        ("397.0 kW AT 4WD - DM Large", _r1s_dm),
        ("397.0 kW AT 4WD - DM Max", _r1s_dm),
        ("496.0 kW AT 4WD - PDM Large", _r1s_pdm),
        ("496.0 kW AT 4WD - PDM Max", _r1s_pdm),
        ("623.0 kW AT 4WD - QM Large", _r1s_qm),
    ],
    "rivian-r2-i": [
        ("SM AT RWD - Standard", _r2_sm),
        ("DM AT 4WD - Standard", _r2_dm),
    ],
}

def ensure_brand(cur):
    cur.execute("SELECT id FROM vehicle_brands WHERE slug = 'rivian'")
    row = cur.fetchone()
    if row:
        print(f"  = Brand exists: Rivian (id={row[0]})")
        return row[0]
    cur.execute("INSERT INTO vehicle_brands (name, slug, is_active, created_at, updated_at) VALUES ('Rivian', 'rivian', true, NOW(), NOW()) RETURNING id")
    bid = cur.fetchone()[0]
    print(f"  + Brand: Rivian (id={bid})")
    return bid

def ensure_models(cur, brand_id):
    for slug, name in REQUIRED_MODELS.items():
        cur.execute("SELECT id FROM vehicle_models WHERE vehicle_brand_id = %s AND slug = %s", (brand_id, slug))
        row = cur.fetchone()
        if not row:
            cur.execute("INSERT INTO vehicle_models (vehicle_brand_id, name, slug, year_from, is_active, created_at, updated_at) VALUES (%s, %s, %s, 0, true, NOW(), NOW()) RETURNING id", (brand_id, name, slug))
            print(f"  + Model: {name} (id={cur.fetchone()[0]})")
        else:
            print(f"  = Model exists: {name} (id={row[0]})")

def deactivate_old(cur, brand_id):
    for s in OLD_MODEL_SLUGS:
        cur.execute("UPDATE vehicle_models SET is_active=false WHERE vehicle_brand_id=%s AND slug=%s AND is_active=true", (brand_id, s))
        if cur.rowcount: print(f"  - Deactivated model: {s}")
    for s in OLD_GENERATION_SLUGS:
        cur.execute("UPDATE vehicle_generations SET is_active=false WHERE slug=%s AND is_active=true", (s,))
        if cur.rowcount: print(f"  - Deactivated generation: {s}")

def seed_generations(cur, brand_id):
    inserted = 0
    for model_slug, gens in GENERATIONS.items():
        cur.execute("SELECT id FROM vehicle_models WHERE vehicle_brand_id = %s AND slug = %s", (brand_id, model_slug))
        model_row = cur.fetchone()
        if not model_row:
            print(f"  SKIP model: {model_slug}")
            continue
        model_id = model_row[0]
        for sort_idx, (gen_name, gen_slug, year_from, year_to) in enumerate(gens):
            cur.execute("SELECT id FROM vehicle_generations WHERE slug = %s", (gen_slug,))
            existing = cur.fetchone()
            if existing:
                cur.execute("""UPDATE vehicle_generations
                    SET vehicle_model_id=%s, name=%s, year_from=%s, year_to=%s, sort_order=%s, is_active=true, updated_at=NOW()
                    WHERE slug=%s""", (model_id, gen_name, year_from, year_to, sort_idx, gen_slug))
                print(f"  ~ Updated: {gen_slug}")
            else:
                cur.execute("""INSERT INTO vehicle_generations
                    (vehicle_model_id, name, slug, year_from, year_to, is_active, sort_order, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, true, %s, NOW(), NOW()) RETURNING id""",
                    (model_id, gen_name, gen_slug, year_from, year_to, sort_idx))
                print(f"  + Generation: {gen_slug} (id={cur.fetchone()[0]})")
                inserted += 1
    return inserted

def seed_specs(cur):
    ok = 0
    for gen_slug, modifications in SPECS_DATA.items():
        cur.execute("SELECT id FROM vehicle_generations WHERE slug = %s", (gen_slug,))
        row = cur.fetchone()
        if not row:
            print(f"  SKIP specs: {gen_slug}")
            continue
        gen_id = row[0]
        if len(modifications) == 1:
            _, raw_specs = modifications[0]
            specs_json = make_specs(raw_specs)
        else:
            specs_json = make_modification_specs(modifications)
        cur.execute("SELECT id FROM vehicle_generation_specs WHERE vehicle_generation_id = %s", (gen_id,))
        existing = cur.fetchone()
        json_str = json.dumps(specs_json, ensure_ascii=False)
        if existing:
            cur.execute("UPDATE vehicle_generation_specs SET specs = %s, updated_at = NOW() WHERE vehicle_generation_id = %s", (json_str, gen_id))
        else:
            cur.execute("INSERT INTO vehicle_generation_specs (vehicle_generation_id, specs, created_at, updated_at) VALUES (%s, %s, NOW(), NOW())", (gen_id, json_str))
        print(f"  + Specs: {gen_slug} ({len(modifications)} mod(s))")
        ok += 1
    return ok

def main():
    print("=" * 60)
    print("4WD.az - Rivian Full Catalog Seeder")
    print("=" * 60)
    conn = get_db()
    cur = conn.cursor()
    print("\n[1] Ensuring brand...")
    brand_id = ensure_brand(cur)
    print("\n[2] Ensuring models...")
    ensure_models(cur, brand_id)
    print("\n[3] Deactivating old duplicates...")
    deactivate_old(cur, brand_id)
    print("\n[4] Seeding generations...")
    gen_count = seed_generations(cur, brand_id)
    print("\n[5] Seeding specs...")
    spec_count = seed_specs(cur)
    conn.commit()
    cur.close()
    conn.close()
    print(f"\n{'=' * 60}")
    print(f"Done! Generations: {gen_count} new, Specs: {spec_count} upserted")
    print("=" * 60)

if __name__ == "__main__":
    main()
