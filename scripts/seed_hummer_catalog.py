#!/usr/bin/env python3
"""
4WD.az - Hummer full catalog seeder.
Seeds all Hummer models, generations, and specs with ALL modifications from auto.ru.
Usage: python3 scripts/seed_hummer_catalog.py
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
    "Независимая, торсионная": "Müstəqil, torsion",
    "Зависимая, рессорная": "Asılı, ressorlu",
    "Зависимая, пружинная": "Asılı, yaylı",
    "Зависимая, листовая": "Asılı, yarpaq ressorlu",
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

# --- Spec variant helpers ---
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


# ============================================================
# MODELS & GENERATIONS
# ============================================================
REQUIRED_MODELS = {
    "h1": "H1",
    "h2": "H2",
    "h3": "H3",
}

GENERATIONS = {
    "h1": [
        ("I", "hummer-h1-i", 1992, 2004),
        ("I Alpha", "hummer-h1-alpha", 2004, 2006),
    ],
    "h2": [
        ("I (GMT820)", "hummer-h2-gmt820", 2002, 2009),
    ],
    "h3": [
        ("I", "hummer-h3-i", 2005, 2010),
    ],
}

OLD_MODEL_SLUGS = []
OLD_GENERATION_SLUGS = ["hummer-h1-alpha", "hummer-h2-gmt820"]


# ============================================================
# SPEC BLOCKS
# ============================================================

# --- H1 I (1992-2004) ---
# 6.5 TD Wagon (197 hp)
_h1_65td_wagon = {
    "Общая информация": [("Страна марки","США"),("Класс автомобиля","J"),("Количество дверей","5"),("Количество мест","6"),("Расположение руля","Левый")],
    "Размеры": [("Длина","4686 мм"),("Ширина","2197 мм"),("Высота","1905 мм"),("Колёсная база","3302 мм"),("Клиренс","406 мм"),("Ширина передней колеи","1829 мм"),("Ширина задней колеи","1829 мм"),("Размер колёс","37x12.5 R17")],
    "Объём и масса": [("Объём багажника","907 л"),("Объём топливного бака","95 л"),("Снаряженная масса","3343 кг"),("Полная масса","4672 кг")],
    "Двигатель": [("Тип двигателя","Дизель"),("Расположение двигателя","Передний, продольное"),("Объём двигателя","6503 см³"),("Наддув","Турбонаддув"),("Максимальная мощность","197 л.с. при 3400 об/мин"),("Максимальный крутящий момент","583 Нм при 1700 об/мин"),("Конфигурация","V-образный"),("Количество цилиндров","8"),("Количество клапанов на цилиндр","2"),("Система питания","Непосредственный впрыск"),("Степень сжатия","21.5"),("Диаметр цилиндра и ход поршня","103.4 × 96.8 мм"),("Код двигателя","6.5L V8 Turbo Diesel"),("ГРМ","OHV")],
    "Трансмиссия": [("Коробка передач","Автомат"),("Количество передач","4"),("Тип привода","Полный")],
    "Эксплуатационные показатели": [("Максимальная скорость","134 км/ч"),("Разгон до 100 км/ч","17.3 с"),("Расход топлива","24.0 / 18.0 / 20.5 л/100км"),("Марка топлива","Дизель")],
    "Подвеска и тормоза": [("Тип передней подвески","Независимая, торсионная"),("Тип задней подвески","Независимая, торсионная"),("Передние тормоза","Дисковые вентилируемые"),("Задние тормоза","Дисковые вентилируемые")],
}
# 6.5 TD (150 hp) — early model
_h1_65td_150 = _set_engine(_h1_65td_wagon, power="150 л.с. при 3400 об/мин", torque="454 Нм при 1700 об/мин", accel="20.0 с", top_speed="126 км/ч")
# 6.5 TD (170 hp)
_h1_65td_170 = _set_engine(_h1_65td_wagon, power="170 л.с. при 3400 об/мин", torque="488 Нм при 1700 об/мин", accel="18.0 с", top_speed="130 км/ч")
# 5.7 V8 (190 hp) gasoline
_h1_57 = _set_engine(_h1_65td_wagon, fuel_type="Бензин", displacement="5735 см³", turbo="Нет", power="190 л.с. при 4000 об/мин", torque="420 Нм при 2400 об/мин", fuel_system="Распределённый впрыск", compression="9.1", bore_stroke="101.6 × 88.4 мм", code="5.7L V8 TBI", accel="18.5 с", top_speed="134 км/ч", fuel_cons="27.0 / 19.0 / 22.0 л/100км", fuel_brand="АИ-92")
# 6.2 V8 Diesel (160 hp) — earliest non-turbo
_h1_62d = _set_engine(_h1_65td_wagon, displacement="6210 см³", turbo="Нет", power="160 л.с. при 3600 об/мин", torque="380 Нм при 2000 об/мин", code="6.2L V8 Diesel", accel="22.0 с", top_speed="120 км/ч")
# Open-top / convertible body
_h1_65td_open = copy.deepcopy(_h1_65td_wagon)
_h1_65td_open["Общая информация"] = [("Страна марки","США"),("Класс автомобиля","J"),("Количество дверей","2"),("Количество мест","4"),("Расположение руля","Левый")]
_h1_65td_open["Объём и масса"] = [("Объём топливного бака","95 л"),("Снаряженная масса","3221 кг"),("Полная масса","4536 кг")]
# Slant-back body
_h1_65td_slant = copy.deepcopy(_h1_65td_wagon)
_h1_65td_slant["Общая информация"] = [("Страна марки","США"),("Класс автомобиля","J"),("Количество дверей","3"),("Количество мест","4"),("Расположение руля","Левый")]
# Pickup body
_h1_65td_pickup = copy.deepcopy(_h1_65td_wagon)
_h1_65td_pickup["Общая информация"] = [("Страна марки","США"),("Класс автомобиля","J"),("Количество дверей","2"),("Количество мест","4"),("Расположение руля","Левый")]
_h1_65td_pickup["Объём и масса"] = [("Объём топливного бака","95 л"),("Снаряженная масса","3175 кг"),("Полная масса","4536 кг")]

# --- H1 ALPHA (2004-2006) ---
_h1_alpha = {
    "Общая информация": [("Страна марки","США"),("Класс автомобиля","J"),("Количество дверей","5"),("Количество мест","6"),("Расположение руля","Левый")],
    "Размеры": [("Длина","4686 мм"),("Ширина","2197 мм"),("Высота","1905 мм"),("Колёсная база","3302 мм"),("Клиренс","406 мм"),("Ширина передней колеи","1829 мм"),("Ширина задней колеи","1829 мм"),("Размер колёс","37x12.5 R17")],
    "Объём и масса": [("Объём багажника","907 л"),("Объём топливного бака","95 л"),("Снаряженная масса","3527 кг"),("Полная масса","4672 кг")],
    "Двигатель": [("Тип двигателя","Дизель"),("Расположение двигателя","Передний, продольное"),("Объём двигателя","6599 см³"),("Наддув","Турбонаддув"),("Максимальная мощность","300 л.с. при 3000 об/мин"),("Максимальный крутящий момент","759 Нм при 1600 об/мин"),("Конфигурация","V-образный"),("Количество цилиндров","8"),("Количество клапанов на цилиндр","4"),("Система питания","Непосредственный впрыск"),("Степень сжатия","17.5"),("Диаметр цилиндра и ход поршня","111.0 × 85.0 мм"),("Код двигателя","Duramax 6600"),("ГРМ","OHV")],
    "Трансмиссия": [("Коробка передач","Автомат"),("Количество передач","5"),("Тип привода","Полный")],
    "Эксплуатационные показатели": [("Максимальная скорость","148 км/ч"),("Разгон до 100 км/ч","13.5 с"),("Расход топлива","22.0 / 16.0 / 18.5 л/100км"),("Марка топлива","Дизель")],
    "Подвеска и тормоза": [("Тип передней подвески","Независимая, торсионная"),("Тип задней подвески","Независимая, торсионная"),("Передние тормоза","Дисковые вентилируемые"),("Задние тормоза","Дисковые вентилируемые")],
}
_h1_alpha_open = copy.deepcopy(_h1_alpha)
_h1_alpha_open["Общая информация"] = [("Страна марки","США"),("Класс автомобиля","J"),("Количество дверей","2"),("Количество мест","4"),("Расположение руля","Левый")]
_h1_alpha_open["Объём и масса"] = [("Объём топливного бака","95 л"),("Снаряженная масса","3402 кг"),("Полная масса","4536 кг")]

# --- H2 I (GMT820, 2002-2009) ---
_h2_60 = {
    "Общая информация": [("Страна марки","США"),("Класс автомобиля","J"),("Количество дверей","5"),("Количество мест","7"),("Расположение руля","Левый")],
    "Размеры": [("Длина","5170 мм"),("Ширина","2062 мм"),("Высота","2012 мм"),("Колёсная база","3119 мм"),("Клиренс","252 мм"),("Ширина передней колеи","1727 мм"),("Ширина задней колеи","1727 мм"),("Размер колёс","315/70 R17")],
    "Объём и масса": [("Объём багажника","1132 / 2453 л"),("Объём топливного бака","121 л"),("Снаряженная масса","2903 кг"),("Полная масса","3856 кг")],
    "Двигатель": [("Тип двигателя","Бензин"),("Расположение двигателя","Передний, продольное"),("Объём двигателя","5967 см³"),("Наддув","Нет"),("Максимальная мощность","316 л.с. при 5200 об/мин"),("Максимальный крутящий момент","488 Нм при 4000 об/мин"),("Конфигурация","V-образный"),("Количество цилиндров","8"),("Количество клапанов на цилиндр","2"),("Система питания","Распределённый впрыск"),("Степень сжатия","9.4"),("Диаметр цилиндра и ход поршня","101.6 × 92.0 мм"),("Код двигателя","Vortec 6000"),("ГРМ","OHV")],
    "Трансмиссия": [("Коробка передач","Автомат"),("Количество передач","4"),("Тип привода","Полный")],
    "Эксплуатационные показатели": [("Максимальная скорость","155 км/ч"),("Разгон до 100 км/ч","10.3 с"),("Расход топлива","23.0 / 16.0 / 18.5 л/100км"),("Марка топлива","АИ-92")],
    "Подвеска и тормоза": [("Тип передней подвески","Независимая, торсионная"),("Тип задней подвески","Зависимая, пружинная"),("Передние тормоза","Дисковые вентилируемые"),("Задние тормоза","Дисковые вентилируемые")],
}
# 6.0 V8 325 hp (post-2005 with displacement-on-demand)
_h2_60_325 = _set_engine(_h2_60, power="325 л.с. при 5200 об/мин", torque="498 Нм при 4000 об/мин", accel="9.8 с")
# 6.0 V8 321 hp
_h2_60_321 = _set_engine(_h2_60, power="321 л.с. при 5200 об/мин", torque="488 Нм при 4000 об/мин", accel="10.0 с")
# 6.2 V8 (393 hp) — 2008-2009
_h2_62 = _set_engine(_h2_60, displacement="6162 см³", power="393 л.с. при 5700 об/мин", torque="563 Нм при 4400 об/мин", bore_stroke="103.3 × 92.0 мм", code="Vortec 6200", accel="8.0 с", fuel_cons="23.0 / 15.0 / 18.0 л/100км")

# H2 SUT (pickup variant)
_h2_sut_60 = copy.deepcopy(_h2_60)
_h2_sut_60["Общая информация"] = [("Страна марки","США"),("Класс автомобиля","J"),("Количество дверей","4"),("Количество мест","5"),("Расположение руля","Левый")]
_h2_sut_60["Размеры"] = [("Длина","5370 мм"),("Ширина","2062 мм"),("Высота","2012 мм"),("Колёсная база","3119 мм"),("Клиренс","252 мм"),("Ширина передней колеи","1727 мм"),("Ширина задней колеи","1727 мм"),("Размер колёс","315/70 R17")]
_h2_sut_60["Объём и масса"] = [("Объём топливного бака","121 л"),("Снаряженная масса","2957 кг"),("Полная масса","3856 кг")]
_h2_sut_60_325 = _set_engine(_h2_sut_60, power="325 л.с. при 5200 об/мин", torque="498 Нм при 4000 об/мин", accel="10.0 с")
_h2_sut_62 = _set_engine(_h2_sut_60, displacement="6162 см³", power="393 л.с. при 5700 об/мин", torque="563 Нм при 4400 об/мин", bore_stroke="103.3 × 92.0 мм", code="Vortec 6200", accel="8.5 с", fuel_cons="23.0 / 15.0 / 18.0 л/100км")

# --- H3 I (2005-2010) ---
_h3_35 = {
    "Общая информация": [("Страна марки","США"),("Класс автомобиля","J"),("Количество дверей","5"),("Количество мест","5"),("Расположение руля","Левый")],
    "Размеры": [("Длина","4742 мм"),("Ширина","1897 мм"),("Высота","1893 мм"),("Колёсная база","2842 мм"),("Клиренс","244 мм"),("Ширина передней колеи","1603 мм"),("Ширина задней колеи","1603 мм"),("Размер колёс","265/75 R16")],
    "Объём и масса": [("Объём багажника","737 / 1645 л"),("Объём топливного бака","87 л"),("Снаряженная масса","2109 кг"),("Полная масса","2767 кг")],
    "Двигатель": [("Тип двигателя","Бензин"),("Расположение двигателя","Передний, продольное"),("Объём двигателя","3460 см³"),("Наддув","Нет"),("Максимальная мощность","220 л.с. при 5600 об/мин"),("Максимальный крутящий момент","305 Нм при 2800 об/мин"),("Конфигурация","Рядный"),("Количество цилиндров","5"),("Количество клапанов на цилиндр","4"),("Система питания","Распределённый впрыск"),("Степень сжатия","10.3"),("Диаметр цилиндра и ход поршня","92.0 × 104.0 мм"),("Код двигателя","Vortec 3500"),("ГРМ","DOHC")],
    "Трансмиссия": [("Коробка передач","Автомат"),("Количество передач","4"),("Тип привода","Полный")],
    "Эксплуатационные показатели": [("Максимальная скорость","180 км/ч"),("Разгон до 100 км/ч","10.6 с"),("Расход топлива","16.8 / 10.2 / 12.4 л/100км"),("Марка топлива","АИ-92")],
    "Подвеска и тормоза": [("Тип передней подвески","Независимая, торсионная"),("Тип задней подвески","Зависимая, пружинная"),("Передние тормоза","Дисковые вентилируемые"),("Задние тормоза","Дисковые вентилируемые")],
}
_h3_35_mt = _mt(_h3_35, 5)
# 3.5 245 hp (2008+)
_h3_35_245 = _set_engine(_h3_35, power="245 л.с. при 5600 об/мин", torque="325 Нм при 3200 об/мин", accel="9.8 с")
_h3_35_245_mt = _mt(_h3_35_245, 5)
# 3.7 V5 (242 hp) — 2007+
_h3_37 = _set_engine(_h3_35, displacement="3653 см³", power="242 л.с. при 5600 об/мин", torque="328 Нм при 4600 об/мин", bore_stroke="95.5 × 102.0 мм", code="Vortec 3700", accel="9.5 с")
_h3_37_mt = _mt(_h3_37, 5)
# 5.3 V8 (300 hp) — H3 Alpha
_h3_53 = _set_engine(_h3_35, displacement="5328 см³", power="300 л.с. при 5200 об/мин", torque="441 Нм при 4000 об/мин", config="V-образный", cylinders="8", valves="2", bore_stroke="96.5 × 92.0 мм", code="Vortec 5300", grm="OHV", accel="8.2 с", top_speed="185 км/ч", fuel_cons="19.5 / 12.5 / 15.0 л/100км")

# H3T pickup
_h3t_37 = copy.deepcopy(_h3_37)
_h3t_37["Общая информация"] = [("Страна марки","США"),("Класс автомобиля","J"),("Количество дверей","4"),("Количество мест","5"),("Расположение руля","Левый")]
_h3t_37["Размеры"] = [("Длина","5437 мм"),("Ширина","1897 мм"),("Высота","1893 мм"),("Колёсная база","3521 мм"),("Клиренс","231 мм"),("Ширина передней колеи","1603 мм"),("Ширина задней колеи","1603 мм"),("Размер колёс","265/75 R16")]
_h3t_37["Объём и масса"] = [("Объём топливного бака","87 л"),("Снаряженная масса","2200 кг"),("Полная масса","2903 кг")]
_h3t_37_mt = _mt(_h3t_37, 5)
_h3t_53 = _set_engine(_h3t_37, displacement="5328 см³", power="300 л.с. при 5200 об/мин", torque="441 Нм при 4000 об/мин", config="V-образный", cylinders="8", valves="2", bore_stroke="96.5 × 92.0 мм", code="Vortec 5300", grm="OHV", accel="8.5 с", top_speed="185 км/ч", fuel_cons="19.5 / 12.5 / 15.0 л/100км")


# ============================================================
# SPECS_DATA - ALL modifications from auto.ru
# ============================================================
SPECS_DATA = {
    "hummer-h1-i": [
        ("6.2d AT (160 a.g.) 4WD – Wagon", _h1_62d),
        ("6.5d AT (150 a.g.) 4WD – Wagon", _h1_65td_150),
        ("6.5d AT (170 a.g.) 4WD – Wagon", _h1_65td_170),
        ("6.5d AT (197 a.g.) 4WD – Wagon", _h1_65td_wagon),
        ("6.5d AT (197 a.g.) 4WD – Open Top", _h1_65td_open),
        ("6.5d AT (197 a.g.) 4WD – Slantback", _h1_65td_slant),
        ("6.5d AT (197 a.g.) 4WD – Pickup", _h1_65td_pickup),
        ("5.7 AT (190 a.g.) 4WD – Wagon", _h1_57),
    ],
    "hummer-h1-alpha": [
        ("6.6d AT (300 a.g.) 4WD – Wagon", _h1_alpha),
        ("6.6d AT (300 a.g.) 4WD – Open Top", _h1_alpha_open),
    ],
    "hummer-h2-gmt820": [
        ("6.0 AT (316 a.g.) 4WD", _h2_60),
        ("6.0 AT (321 a.g.) 4WD", _h2_60_321),
        ("6.0 AT (325 a.g.) 4WD", _h2_60_325),
        ("6.2 AT (393 a.g.) 4WD", _h2_62),
        ("6.0 AT (316 a.g.) 4WD – SUT", _h2_sut_60),
        ("6.0 AT (325 a.g.) 4WD – SUT", _h2_sut_60_325),
        ("6.2 AT (393 a.g.) 4WD – SUT", _h2_sut_62),
    ],
    "hummer-h3-i": [
        ("3.5 AT (220 a.g.) 4WD", _h3_35),
        ("3.5 MT (220 a.g.) 4WD", _h3_35_mt),
        ("3.5 AT (245 a.g.) 4WD", _h3_35_245),
        ("3.5 MT (245 a.g.) 4WD", _h3_35_245_mt),
        ("3.7 AT (242 a.g.) 4WD", _h3_37),
        ("3.7 MT (242 a.g.) 4WD", _h3_37_mt),
        ("5.3 AT (300 a.g.) 4WD – Alpha", _h3_53),
        ("3.7 AT (242 a.g.) 4WD – H3T", _h3t_37),
        ("3.7 MT (242 a.g.) 4WD – H3T", _h3t_37_mt),
        ("5.3 AT (300 a.g.) 4WD – H3T Alpha", _h3t_53),
    ],
}


# ============================================================
# DB FUNCTIONS
# ============================================================
def ensure_brand(cur):
    cur.execute("SELECT id FROM vehicle_brands WHERE slug = 'hummer'")
    row = cur.fetchone()
    if row:
        print(f"  = Brand exists: Hummer (id={row[0]})")
        return row[0]
    cur.execute("INSERT INTO vehicle_brands (name, slug, is_active, created_at, updated_at) VALUES ('Hummer', 'hummer', true, NOW(), NOW()) RETURNING id")
    bid = cur.fetchone()[0]
    print(f"  + Brand: Hummer (id={bid})")
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
    print("4WD.az - Hummer Full Catalog Seeder")
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
