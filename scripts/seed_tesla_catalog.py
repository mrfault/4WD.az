#!/usr/bin/env python3
"""
4WD.az - Tesla full catalog seeder.
Seeds all Tesla models, generations, and specs with ALL modifications from auto.ru.
Usage: python3 scripts/seed_tesla_catalog.py
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
    "Ёмкость батареи": "Batareya tutumu", "Запас хода": "Yürüş ehtiyatı",
    "Левый": "Sol", "Правый": "Sağ", "Левый, Правый": "Sol, Sağ",
    "Бензин": "Benzin", "Бензиновый": "Benzin", "Дизель": "Dizel",
    "Дизельный": "Dizel", "Гибридный": "Hibrid", "Электро": "Elektrik",
    "Автомат": "Avtomat", "Механика": "Mexaniki", "Вариатор": "Variator",
    "Робот": "Robot", "Полный": "Tam", "Передний": "Ön", "Задний": "Arxa",
    "Независимая, пружинная": "Müstəqil, yaylı",
    "Независимая, пневматическая": "Müstəqil, pnevmatik",
    "Зависимая, рессорная": "Asılı, ressorlu",
    "Зависимая, пружинная": "Asılı, yaylı",
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
    ("кг","kq"),("Нм","Nm"),("кВтч","kVt·s"),("кВт·ч","kVt·s"),
    ("кВт","kVt"),("г/км","q/km"),
    ("АИ-","AI-"),("Евро ","Avro "),(" при "," @ "),(" л"," l"),
    (" км"," km"),
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
           "co2": "Выброс CO2", "battery": "Ёмкость батареи", "range": "Запас хода"}
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

def _drive(spec, drv="Передний"):
    n = {}
    for g, items in spec.items():
        n[g] = [(k, drv if k == "Тип привода" else v) for k, v in items]
    return n


# ============================================================
# MODELS & GENERATIONS
# ============================================================
REQUIRED_MODELS = {
    "model-x": "Model X",
    "cybertruck": "Cybertruck",
    "model-y": "Model Y",
}

GENERATIONS = {
    "model-x": [
        ("I", "tesla-model-x-i", 2015, 2021),
        ("I Restaylinq", "tesla-model-x-i-r", 2021, None),
    ],
    "cybertruck": [
        ("I", "tesla-cybertruck-i", 2023, None),
    ],
    "model-y": [
        ("I", "tesla-model-y-i", 2019, 2024),
        ("I Restaylinq (Juniper)", "tesla-model-y-i-r", 2024, None),
    ],
}

OLD_MODEL_SLUGS = []
OLD_GENERATION_SLUGS = []


# ============================================================
# SPEC BLOCKS
# ============================================================

# --- MODEL X I (2015-2021) ---
# Base: 100D (525 hp)
_mx_i_100d = {
    "Общая информация": [("Страна марки","США"),("Класс автомобиля","E"),("Количество дверей","5"),("Количество мест","5"),("Расположение руля","Левый")],
    "Размеры": [("Длина","5037 мм"),("Ширина","2070 мм"),("Высота","1684 мм"),("Колёсная база","2965 мм"),("Клиренс","170 мм"),("Ширина передней колеи","1661 мм"),("Ширина задней колеи","1699 мм"),("Размер колёс","255/45 R20, 265/35 R22")],
    "Объём и масса": [("Объём багажника","2180 л"),("Снаряженная масса","2459 кг"),("Полная масса","3062 кг")],
    "Двигатель": [("Тип двигателя","Электро"),("Объём двигателя","—"),("Наддув","Нет"),("Максимальная мощность","525 л.с."),("Максимальный крутящий момент","660 Нм"),("Ёмкость батареи","100 кВтч"),("Запас хода","565 км")],
    "Трансмиссия": [("Коробка передач","Автомат"),("Количество передач","1"),("Тип привода","Полный")],
    "Эксплуатационные показатели": [("Максимальная скорость","250 км/ч"),("Разгон до 100 км/ч","4.9 с"),("Расход топлива","20.8 кВтч/100 км")],
    "Подвеска и тормоза": [("Тип передней подвески","Независимая, пневматическая"),("Тип задней подвески","Независимая, пневматическая"),("Передние тормоза","Дисковые вентилируемые"),("Задние тормоза","Дисковые вентилируемые")],
}
# 75D (333 hp, 75 kWh)
_mx_i_75d = _set_engine(_mx_i_100d, power="333 л.с.", torque="525 Нм", battery="75 кВтч", range="417 км", weight="2352 кг", gross_weight="2955 кг", accel="5.2 с", top_speed="210 км/ч")
# 90D (422 hp, 90 kWh)
_mx_i_90d = _set_engine(_mx_i_100d, power="422 л.с.", torque="660 Нм", battery="90 кВтч", range="489 км", weight="2389 кг", gross_weight="2992 кг", accel="4.6 с", top_speed="250 км/ч")
# Long Range (523 hp, 100 kWh) — 2019-2021
_mx_i_lr = _set_engine(_mx_i_100d, power="523 л.с.", torque="660 Нм", range="580 км", accel="4.6 с")
# P90D (762 hp, 90 kWh)
_mx_i_p90d = _set_engine(_mx_i_100d, power="762 л.с.", torque="967 Нм", battery="90 кВтч", range="467 км", weight="2439 кг", gross_weight="3042 кг", accel="3.4 с", top_speed="250 км/ч")
# P100D (773 hp, 100 kWh)
_mx_i_p100d = _set_engine(_mx_i_100d, power="773 л.с.", torque="967 Нм", weight="2509 кг", gross_weight="3112 кг", accel="2.9 с", top_speed="250 км/ч")
# Performance (795 hp, 100 kWh) — 2019-2021
_mx_i_perf = _set_engine(_mx_i_100d, power="795 л.с.", torque="967 Нм", weight="2509 кг", gross_weight="3112 кг", accel="2.8 с", top_speed="261 км/ч")
# 60D (333 hp, 60 kWh)
_mx_i_60d = _set_engine(_mx_i_75d, battery="60 кВтч", range="355 км", weight="2300 кг", gross_weight="2903 кг", accel="6.2 с", top_speed="210 км/ч")
# 7-seat variants
_mx_i_100d_7 = copy.deepcopy(_mx_i_100d)
_mx_i_100d_7["Общая информация"] = [("Страна марки","США"),("Класс автомобиля","E"),("Количество дверей","5"),("Количество мест","7"),("Расположение руля","Левый")]
_mx_i_75d_7 = _set_engine(_mx_i_100d_7, power="333 л.с.", torque="525 Нм", battery="75 кВтч", range="417 км", weight="2389 кг", gross_weight="2992 кг", accel="5.2 с", top_speed="210 км/ч")
_mx_i_lr_7 = _set_engine(_mx_i_100d_7, power="523 л.с.", torque="660 Нм", range="580 км", weight="2509 кг", gross_weight="3112 кг", accel="4.6 с")

# --- MODEL X I R (2021+) ---
_mx_ir_lr = {
    "Общая информация": [("Страна марки","США"),("Класс автомобиля","E"),("Количество дверей","5"),("Количество мест","5"),("Расположение руля","Левый")],
    "Размеры": [("Длина","5037 мм"),("Ширина","2070 мм"),("Высота","1680 мм"),("Колёсная база","2965 мм"),("Клиренс","170 мм"),("Ширина передней колеи","1661 мм"),("Ширина задней колеи","1699 мм"),("Размер колёс","255/45 R20, 265/35 R22")],
    "Объём и масса": [("Объём багажника","2180 л"),("Снаряженная масса","2352 кг"),("Полная масса","2955 кг")],
    "Двигатель": [("Тип двигателя","Электро"),("Объём двигателя","—"),("Наддув","Нет"),("Максимальная мощность","670 л.с."),("Максимальный крутящий момент","800 Нм"),("Ёмкость батареи","100 кВтч"),("Запас хода","576 км")],
    "Трансмиссия": [("Коробка передач","Автомат"),("Количество передач","1"),("Тип привода","Полный")],
    "Эксплуатационные показатели": [("Максимальная скорость","250 км/ч"),("Разгон до 100 км/ч","3.9 с"),("Расход топлива","18.8 кВтч/100 км")],
    "Подвеска и тормоза": [("Тип передней подвески","Независимая, пневматическая"),("Тип задней подвески","Независимая, пневматическая"),("Передние тормоза","Дисковые вентилируемые"),("Задние тормоза","Дисковые вентилируемые")],
}
_mx_ir_plaid = _set_engine(_mx_ir_lr, power="1020 л.с.", torque="1140 Нм", range="543 км", weight="2455 кг", gross_weight="3058 кг", accel="2.6 с", top_speed="262 км/ч")
_mx_ir_lr_7 = copy.deepcopy(_mx_ir_lr)
_mx_ir_lr_7["Общая информация"] = [("Страна марки","США"),("Класс автомобиля","E"),("Количество дверей","5"),("Количество мест","7"),("Расположение руля","Левый")]
_mx_ir_plaid_7 = _set_engine(_mx_ir_lr_7, power="1020 л.с.", torque="1140 Нм", range="543 км", weight="2455 кг", gross_weight="3058 кг", accel="2.6 с", top_speed="262 км/ч")

# --- MODEL Y I (2019-2024) ---
_my_i_sr = {
    "Общая информация": [("Страна марки","США"),("Класс автомобиля","D"),("Количество дверей","5"),("Количество мест","5"),("Расположение руля","Левый")],
    "Размеры": [("Длина","4751 мм"),("Ширина","1921 мм"),("Высота","1624 мм"),("Колёсная база","2890 мм"),("Клиренс","167 мм"),("Ширина передней колеи","1636 мм"),("Ширина задней колеи","1636 мм"),("Размер колёс","255/45 R19, 255/40 R20")],
    "Объём и масса": [("Объём багажника","854 / 2158 л"),("Снаряженная масса","1909 кг"),("Полная масса","2313 кг")],
    "Двигатель": [("Тип двигателя","Электро"),("Объём двигателя","—"),("Наддув","Нет"),("Максимальная мощность","299 л.с."),("Максимальный крутящий момент","420 Нм"),("Ёмкость батареи","60 кВтч"),("Запас хода","430 км")],
    "Трансмиссия": [("Коробка передач","Автомат"),("Количество передач","1"),("Тип привода","Задний")],
    "Эксплуатационные показатели": [("Максимальная скорость","217 км/ч"),("Разгон до 100 км/ч","6.9 с"),("Расход топлива","15.7 кВтч/100 км")],
    "Подвеска и тормоза": [("Тип передней подвески","Независимая, пружинная"),("Тип задней подвески","Независимая, пружинная"),("Передние тормоза","Дисковые вентилируемые"),("Задние тормоза","Дисковые вентилируемые")],
}
# Long Range AWD
_my_i_lr = _set_engine(_my_i_sr, power="346 л.с.", torque="493 Нм", battery="75 кВтч", range="507 км", drive="Полный", weight="1979 кг", gross_weight="2383 кг", accel="5.0 с", top_speed="217 км/ч")
# Performance AWD
_my_i_perf = _set_engine(_my_i_lr, power="462 л.с.", torque="639 Нм", range="486 км", weight="2003 кг", gross_weight="2407 кг", accel="3.7 с", top_speed="250 км/ч")
# Long Range RWD (China/2023)
_my_i_lr_rwd = _set_engine(_my_i_sr, power="299 л.с.", torque="420 Нм", battery="60 кВтч", range="455 км", weight="1909 кг", accel="6.9 с")
# 7-seat variants
_my_i_lr_7 = copy.deepcopy(_my_i_lr)
_my_i_lr_7["Общая информация"] = [("Страна марки","США"),("Класс автомобиля","D"),("Количество дверей","5"),("Количество мест","7"),("Расположение руля","Левый")]
_my_i_lr_7["Объём и масса"] = [("Объём багажника","854 / 2158 л"),("Снаряженная масса","2003 кг"),("Полная масса","2407 кг")]

# --- MODEL Y I R (Juniper, 2024+) ---
_my_ir_lr = {
    "Общая информация": [("Страна марки","США"),("Класс автомобиля","D"),("Количество дверей","5"),("Количество мест","5"),("Расположение руля","Левый")],
    "Размеры": [("Длина","4797 мм"),("Ширина","1920 мм"),("Высота","1624 мм"),("Колёсная база","2890 мм"),("Клиренс","167 мм"),("Ширина передней колеи","1636 мм"),("Ширина задней колеи","1636 мм"),("Размер колёс","255/45 R19, 255/40 R20")],
    "Объём и масса": [("Объём багажника","854 / 2158 л"),("Снаряженная масса","1998 кг"),("Полная масса","2402 кг")],
    "Двигатель": [("Тип двигателя","Электро"),("Объём двигателя","—"),("Наддув","Нет"),("Максимальная мощность","350 л.с."),("Максимальный крутящий момент","493 Нм"),("Ёмкость батареи","75 кВтч"),("Запас хода","533 км")],
    "Трансмиссия": [("Коробка передач","Автомат"),("Количество передач","1"),("Тип привода","Полный")],
    "Эксплуатационные показатели": [("Максимальная скорость","217 км/ч"),("Разгон до 100 км/ч","4.8 с"),("Расход топлива","15.5 кВтч/100 км")],
    "Подвеска и тормоза": [("Тип передней подвески","Независимая, пружинная"),("Тип задней подвески","Независимая, пружинная"),("Передние тормоза","Дисковые вентилируемые"),("Задние тормоза","Дисковые вентилируемые")],
}
_my_ir_lr_rwd = _set_engine(_my_ir_lr, power="299 л.с.", torque="420 Нм", drive="Задний", range="600 км", weight="1909 кг", gross_weight="2313 кг", accel="5.9 с")
_my_ir_perf = _set_engine(_my_ir_lr, power="462 л.с.", torque="639 Нм", range="514 км", weight="2022 кг", gross_weight="2426 кг", accel="3.7 с", top_speed="250 км/ч")
_my_ir_lr_7 = copy.deepcopy(_my_ir_lr)
_my_ir_lr_7["Общая информация"] = [("Страна марки","США"),("Класс автомобиля","D"),("Количество дверей","5"),("Количество мест","7"),("Расположение руля","Левый")]

# --- CYBERTRUCK I (2023+) ---
_ct_awd = {
    "Общая информация": [("Страна марки","США"),("Класс автомобиля","J"),("Количество дверей","4"),("Количество мест","5"),("Расположение руля","Левый")],
    "Размеры": [("Длина","5682 мм"),("Ширина","2200 мм"),("Высота","1790 мм"),("Колёсная база","3681 мм"),("Клиренс","305 мм"),("Ширина передней колеи","1800 мм"),("Ширина задней колеи","1800 мм"),("Размер колёс","285/65 R20")],
    "Объём и масса": [("Объём багажника","1897 л"),("Снаряженная масса","3104 кг"),("Полная масса","4081 кг")],
    "Двигатель": [("Тип двигателя","Электро"),("Объём двигателя","—"),("Наддув","Нет"),("Максимальная мощность","600 л.с."),("Максимальный крутящий момент","930 Нм"),("Ёмкость батареи","123 кВтч"),("Запас хода","547 км")],
    "Трансмиссия": [("Коробка передач","Автомат"),("Количество передач","1"),("Тип привода","Полный")],
    "Эксплуатационные показатели": [("Максимальная скорость","180 км/ч"),("Разгон до 100 км/ч","4.3 с"),("Расход топлива","23.1 кВтч/100 км")],
    "Подвеска и тормоза": [("Тип передней подвески","Независимая, пневматическая"),("Тип задней подвески","Независимая, пневматическая"),("Передние тормоза","Дисковые вентилируемые"),("Задние тормоза","Дисковые вентилируемые")],
}
_ct_cyberbeast = _set_engine(_ct_awd, power="845 л.с.", torque="1323 Нм", range="515 км", weight="3201 кг", gross_weight="4178 кг", accel="2.7 с", top_speed="209 км/ч")
_ct_rwd = _set_engine(_ct_awd, power="315 л.с.", torque="490 Нм", battery="100 кВтч", range="402 км", drive="Задний", weight="2833 кг", gross_weight="3810 кг", accel="6.7 с", top_speed="180 км/ч")


# ============================================================
# SPECS_DATA - ALL modifications from auto.ru
# ============================================================
SPECS_DATA = {
    "tesla-model-x-i": [
        ("60D AT (333 a.g.) 4WD", _mx_i_60d),
        ("75D AT (333 a.g.) 4WD", _mx_i_75d),
        ("75D AT (333 a.g.) 4WD 7 oturacaq", _mx_i_75d_7),
        ("90D AT (422 a.g.) 4WD", _mx_i_90d),
        ("100D AT (525 a.g.) 4WD", _mx_i_100d),
        ("100D AT (525 a.g.) 4WD 7 oturacaq", _mx_i_100d_7),
        ("P90D AT (762 a.g.) 4WD", _mx_i_p90d),
        ("P100D AT (773 a.g.) 4WD", _mx_i_p100d),
        ("Long Range AT (523 a.g.) 4WD", _mx_i_lr),
        ("Long Range AT (523 a.g.) 4WD 7 oturacaq", _mx_i_lr_7),
        ("Performance AT (795 a.g.) 4WD", _mx_i_perf),
    ],
    "tesla-model-x-i-r": [
        ("Long Range AT (670 a.g.) 4WD", _mx_ir_lr),
        ("Long Range AT (670 a.g.) 4WD 7 oturacaq", _mx_ir_lr_7),
        ("Plaid AT (1020 a.g.) 4WD", _mx_ir_plaid),
        ("Plaid AT (1020 a.g.) 4WD 7 oturacaq", _mx_ir_plaid_7),
    ],
    "tesla-model-y-i": [
        ("Standard Range AT (299 a.g.) RWD", _my_i_sr),
        ("Long Range AT (346 a.g.) 4WD", _my_i_lr),
        ("Long Range AT (346 a.g.) 4WD 7 oturacaq", _my_i_lr_7),
        ("Performance AT (462 a.g.) 4WD", _my_i_perf),
    ],
    "tesla-model-y-i-r": [
        ("Long Range RWD AT (299 a.g.) RWD", _my_ir_lr_rwd),
        ("Long Range AT (350 a.g.) 4WD", _my_ir_lr),
        ("Long Range AT (350 a.g.) 4WD 7 oturacaq", _my_ir_lr_7),
        ("Performance AT (462 a.g.) 4WD", _my_ir_perf),
    ],
    "tesla-cybertruck-i": [
        ("RWD AT (315 a.g.) RWD", _ct_rwd),
        ("All-Wheel Drive AT (600 a.g.) 4WD", _ct_awd),
        ("Cyberbeast AT (845 a.g.) 4WD", _ct_cyberbeast),
    ],
}


# ============================================================
# DB FUNCTIONS
# ============================================================
def ensure_brand(cur):
    cur.execute("SELECT id FROM vehicle_brands WHERE slug = 'tesla'")
    row = cur.fetchone()
    if row:
        print(f"  = Brand exists: Tesla (id={row[0]})")
        return row[0]
    cur.execute("INSERT INTO vehicle_brands (name, slug, is_active, created_at, updated_at) VALUES ('Tesla', 'tesla', true, NOW(), NOW()) RETURNING id")
    bid = cur.fetchone()[0]
    print(f"  + Brand: Tesla (id={bid})")
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
    print("4WD.az - Tesla Full Catalog Seeder")
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
