#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Конвертер данных из нового формата (периоды по дням) в старый формат (недели)
Преобразует period_1.json, period_2.json в real-data.json
И targets_period_1.json, targets_period_2.json в targets.json
"""

import json
import os
from datetime import datetime
from collections import defaultdict
from typing import Dict, List, Any

# Цвета для регионов
REGION_COLORS = [
    '#2c3e50', '#34495e', '#1abc9c', '#16a085', '#27ae60', '#2ecc71',
    '#8e44ad', '#9b59b6', '#2980b9', '#3498db', '#e74c3c', '#c0392b',
    '#d35400', '#e67e22', '#f39c12', '#f1c40f', '#7f8c8d', '#95a5a6'
]

def load_json_file(filepath: str) -> Any:
    """Загружает JSON файл"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"⚠️  Файл {filepath} не найден")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Ошибка парсинга JSON в файле {filepath}: {e}")
        return None

def save_json_file(data: Any, filepath: str) -> bool:
    """Сохраняет данные в JSON файл"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ Файл {filepath} успешно создан")
        return True
    except Exception as e:
        print(f"❌ Ошибка сохранения файла {filepath}: {e}")
        return False

def get_date_range(period_data: List[Dict]) -> str:
    """Получает диапазон дат из данных периода"""
    if not period_data:
        return ""
    
    dates = [datetime.fromisoformat(item['date'].replace('T00:00:00', '')) for item in period_data]
    dates.sort()
    
    start_date = dates[0].strftime('%d.%m.%Y')
    end_date = dates[-1].strftime('%d.%m.%Y')
    
    return f"{start_date} - {end_date}"

def group_by_keys(data: List[Dict], keys: List[str]) -> Dict:
    """Группирует данные по указанным ключам"""
    result = defaultdict(lambda: defaultdict(list))
    
    for item in data:
        region_id = item[keys[0]]
        store_id = item[keys[1]]
        result[region_id][store_id].append(item)
    
    return dict(result)

def aggregate_store_data(store_days: List[Dict]) -> Dict:
    """Агрегирует данные магазина по дням в сводку за период"""
    if not store_days:
        return {}
    
    # Суммируем все числовые поля
    aggregated = {
        'plan': sum(day.get('plan', 0) for day in store_days),
        'fact': sum(day.get('fact', 0) for day in store_days),
        'losses': sum(day.get('losses', 0) for day in store_days),
        'shortages': sum(day.get('shortages', 0) for day in store_days),
        'fop': sum(day.get('fop', 0) for day in store_days),
        'unprocessed': sum(day.get('unprocessed', 0) for day in store_days),
        'back_product': sum(day.get('back_product', 0) for day in store_days),
    }
    
    # Добавляем поля, которые могут отсутствовать в новом формате
    aggregated.update({
        'shiftRemainder': 0,  # Если этого поля нет в новом формате
        'percent': 0  # Будет рассчитан позже
    })
    
    return aggregated

def convert_periods_to_weeks(period1_data: List[Dict], period2_data: List[Dict]) -> Dict:
    """Конвертирует данные периодов в формат недель"""
    
    # Создаем структуру недель
    weeks = []
    if period1_data:
        weeks.append({
            "id": "week_1",
            "name": "Период 1", 
            "dateRange": get_date_range(period1_data)
        })
    
    if period2_data:
        weeks.append({
            "id": "week_2", 
            "name": "Период 2",
            "dateRange": get_date_range(period2_data)
        })
    
    # Обрабатываем данные по периодам
    regions = {}
    region_color_map = {}
    
    # Функция для обработки одного периода
    def process_period(period_data: List[Dict], week_id: str):
        if not period_data:
            return
            
        grouped_data = group_by_keys(period_data, ['regionId', 'storeId'])
        
        for region_id, region_stores in grouped_data.items():
            # Инициализируем регион если его еще нет
            if region_id not in regions:
                first_store = next(iter(region_stores.values()))[0]
                
                # Назначаем цвет региону
                if region_id not in region_color_map:
                    color_index = len(region_color_map) % len(REGION_COLORS)
                    region_color_map[region_id] = REGION_COLORS[color_index]
                
                regions[region_id] = {
                    "id": region_id,
                    "name": first_store['regionName'],
                    "color": region_color_map[region_id],
                    "stores": []
                }
            
            # Обрабатываем магазины в регионе
            for store_id, store_days in region_stores.items():
                # Ищем существующий магазин или создаем новый
                store = None
                for existing_store in regions[region_id]['stores']:
                    if existing_store['id'] == store_id:
                        store = existing_store
                        break
                
                if store is None:
                    store = {
                        "id": store_id,
                        "name": store_days[0]['storeName'],
                        "weeklyData": []
                    }
                    regions[region_id]['stores'].append(store)
                
                # Агрегируем данные за период
                period_summary = aggregate_store_data(store_days)
                period_summary['weekId'] = week_id
                
                store['weeklyData'].append(period_summary)
    
    # Обрабатываем оба периода
    process_period(period1_data, "week_1")
    process_period(period2_data, "week_2")
    
    return {
        "weeks": weeks,
        "regions": regions
    }

def convert_targets(targets1_data: Dict, targets2_data: Dict) -> Dict:
    """Конвертирует данные целей из двух периодов в единый формат"""
    
    # Объединяем targetTree (предполагаем, что они одинаковые или берем из первого периода)
    target_tree = {}
    if targets1_data and 'targetTree' in targets1_data:
        target_tree = targets1_data['targetTree']
    elif targets2_data and 'targetTree' in targets2_data:
        target_tree = targets2_data['targetTree']
    
    # Объединяем storeTargets
    store_targets = {}
    if targets1_data and 'storeTargets' in targets1_data:
        store_targets.update(targets1_data['storeTargets'])
    if targets2_data and 'storeTargets' in targets2_data:
        store_targets.update(targets2_data['storeTargets'])
    
    return {
        "targetTree": target_tree,
        "storeTargets": store_targets
    }

def validate_input_data(period1_data, period2_data):
    """Валидирует входящие данные"""
    errors = []
    
    if not period1_data and not period2_data:
        errors.append("Не найдено данных ни в одном из периодов")
        return errors
    
    # Проверяем структуру данных
    for period_name, data in [("period_1", period1_data), ("period_2", period2_data)]:
        if data:
            if not isinstance(data, list):
                errors.append(f"{period_name}: данные должны быть массивом")
                continue
                
            if not data:
                errors.append(f"{period_name}: массив данных пустой")
                continue
                
            # Проверяем обязательные поля в первой записи
            required_fields = ['date', 'regionId', 'regionName', 'storeId', 'storeName']
            first_record = data[0]
            
            for field in required_fields:
                if field not in first_record:
                    errors.append(f"{period_name}: отсутствует обязательное поле '{field}'")
    
    return errors

def print_conversion_stats(result_data: Dict):
    """Выводит статистику конвертации"""
    weeks_count = len(result_data.get('weeks', []))
    regions_count = len(result_data.get('regions', {}))
    
    stores_count = 0
    for region in result_data.get('regions', {}).values():
        stores_count += len(region.get('stores', []))
    
    print("\n📊 Статистика конвертации:")
    print(f"   Периодов (недель): {weeks_count}")
    print(f"   Регионов: {regions_count}")
    print(f"   Магазинов: {stores_count}")
    
    # Выводим информацию по регионам
    if regions_count > 0:
        print(f"\n🏪 Регионы:")
        for region_id, region in result_data.get('regions', {}).items():
            stores_in_region = len(region.get('stores', []))
            print(f"   {region.get('name', region_id)}: {stores_in_region} магазинов")

def main():
    """Основная функция конвертера"""
    print("🔄 Запуск конвертера данных из нового формата в старый")
    print("=" * 60)
    
    # Загружаем данные
    print("📁 Загрузка файлов данных...")
    period1_data = load_json_file('period_1.json')
    period2_data = load_json_file('period_2.json')
    targets1_data = load_json_file('targets_period_1.json')
    targets2_data = load_json_file('targets_period_2.json')
    
    # Валидируем данные
    validation_errors = validate_input_data(period1_data, period2_data)
    if validation_errors:
        print("\n❌ Ошибки валидации:")
        for error in validation_errors:
            print(f"   • {error}")
        return False
    
    print("✅ Данные успешно загружены и проверены")
    
    # Конвертируем основные данные
    print("\n🔄 Конвертация основных данных...")
    try:
        converted_data = convert_periods_to_weeks(period1_data, period2_data)
        
        # Выводим статистику
        print_conversion_stats(converted_data)
        
        # Сохраняем основные данные
        if save_json_file(converted_data, 'real-data.json'):
            print("✅ Основные данные сконвертированы")
        else:
            return False
            
    except Exception as e:
        print(f"❌ Ошибка конвертации основных данных: {e}")
        return False
    
    # Конвертируем данные целей
    print("\n🔄 Конвертация данных целей...")
    try:
        if targets1_data or targets2_data:
            converted_targets = convert_targets(targets1_data, targets2_data)
            
            if save_json_file(converted_targets, 'targets.json'):
                print("✅ Данные целей сконвертированы")
            else:
                return False
        else:
            print("⚠️  Файлы целей не найдены, пропускаем")
            
    except Exception as e:
        print(f"❌ Ошибка конвертации данных целей: {e}")
        return False
    
    print("\n🎉 Конвертация успешно завершена!")
    print("📝 Созданные файлы:")
    print("   • real-data.json - основные данные в старом формате")
    if targets1_data or targets2_data:
        print("   • targets.json - данные целей в старом формате")
    
    print("\n💡 Теперь вы можете использовать старый код без изменений")
    return True

def create_sample_files():
    """Создает примеры файлов для тестирования"""
    print("📝 Создание примеров файлов для тестирования...")
    
    # Пример данных period_1.json
    sample_period1 = [
        {
            "date": "2025-06-01T00:00:00",
            "regionId": "000000002", 
            "regionName": "Белая Церковь",
            "storeId": "000100464",
            "storeName": "87 БЦ (ЩЕДРИК) Грушевского",
            "plan": 45000,
            "fact": 69203.5,
            "losses": 385.76,
            "shortages": 14680.73,
            "fop": 120.5,
            "unprocessed": 50.0,
            "back_product": 200.0
        },
        {
            "date": "2025-06-02T00:00:00",
            "regionId": "000000002",
            "regionName": "Белая Церковь", 
            "storeId": "000100464",
            "storeName": "87 БЦ (ЩЕДРИК) Грушевского",
            "plan": 47000,
            "fact": 71500.0,
            "losses": 290.45,
            "shortages": 13200.0,
            "fop": 95.0,
            "unprocessed": 75.5,
            "back_product": 180.0
        }
    ]
    
    # Пример данных period_2.json
    sample_period2 = [
        {
            "date": "2025-07-01T00:00:00",
            "regionId": "000000002",
            "regionName": "Белая Церковь",
            "storeId": "000100464", 
            "storeName": "87 БЦ (ЩЕДРИК) Грушевского",
            "plan": 48000,
            "fact": 73200.0,
            "losses": 320.15,
            "shortages": 12800.0,
            "fop": 110.0,
            "unprocessed": 40.0,
            "back_product": 220.0
        }
    ]
    
    # Пример targets_period_1.json
    sample_targets = {
        "targetTree": {
            "turnover": {
                "name": "Оборот",
                "type": "positive",
                "maxScore": 100
            },
            "losses": {
                "name": "Потери",
                "type": "negative", 
                "maxScore": 20
            },
            "shortages": {
                "name": "Недостачи",
                "type": "negative",
                "maxScore": 20
            }
        },
        "storeTargets": {
            "000100464": {
                "losses": 0.005,
                "shortages": 0.02
            }
        }
    }
    
    # Сохраняем примеры
    save_json_file(sample_period1, 'sample_period_1.json')
    save_json_file(sample_period2, 'sample_period_2.json') 
    save_json_file(sample_targets, 'sample_targets_period_1.json')
    save_json_file(sample_targets, 'sample_targets_period_2.json')
    
    print("✅ Примеры файлов созданы:")
    print("   • sample_period_1.json")
    print("   • sample_period_2.json") 
    print("   • sample_targets_period_1.json")
    print("   • sample_targets_period_2.json")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "sample":
        create_sample_files()
    else:
        success = main()
        sys.exit(0 if success else 1)