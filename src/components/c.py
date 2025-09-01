#!/usr/bin/env python3
"""
Скрипт для удаления комментариев из Vue.js 3 компонентов
Поддерживает HTML, JavaScript и CSS комментарии
Автор: COM аддон для SMK Analytics
"""

import os
import re
import glob
from pathlib import Path

def find_vue_files():
    """Поиск всех .vue файлов в текущей директории"""
    vue_files = glob.glob("**/*.vue", recursive=True)
    return vue_files

def remove_html_comments(content):
    """Удаление HTML комментариев <!-- -->"""
    # Удаляем HTML комментарии, но сохраняем структуру
    pattern = r'<!--.*?-->'
    return re.sub(pattern, '', content, flags=re.DOTALL)

def remove_js_comments(content):
    """Удаление JavaScript комментариев // и /* */"""
    lines = content.split('\n')
    cleaned_lines = []
    in_multiline_comment = False
    
    for line in lines:
        original_line = line
        cleaned_line = ""
        i = 0
        
        while i < len(line):
            # Проверяем многострочный комментарий
            if not in_multiline_comment and i < len(line) - 1 and line[i:i+2] == '/*':
                # Ищем закрытие комментария на той же строке
                end_pos = line.find('*/', i + 2)
                if end_pos != -1:
                    # Комментарий закрывается на той же строке
                    i = end_pos + 2
                    continue
                else:
                    # Начинается многострочный комментарий
                    in_multiline_comment = True
                    break
            elif in_multiline_comment:
                # Ищем закрытие многострочного комментария
                end_pos = line.find('*/', i)
                if end_pos != -1:
                    in_multiline_comment = False
                    i = end_pos + 2
                    continue
                else:
                    # Весь остаток строки - часть комментария
                    break
            
            # Проверяем однострочный комментарий
            elif not in_multiline_comment and i < len(line) - 1 and line[i:i+2] == '//':
                # Проверяем, что // не внутри строки
                line_before = line[:i]
                single_quotes = line_before.count("'") - line_before.count("\\'")
                double_quotes = line_before.count('"') - line_before.count('\\"')
                
                if single_quotes % 2 == 0 and double_quotes % 2 == 0:
                    # Не внутри строки - это комментарий
                    break
                else:
                    # Внутри строки - не комментарий
                    cleaned_line += line[i]
                    i += 1
            else:
                # Обычный символ
                if not in_multiline_comment:
                    cleaned_line += line[i]
                i += 1
        
        # Добавляем очищенную строку только если она не пустая или содержит код
        if not in_multiline_comment:
            cleaned_line = cleaned_line.rstrip()
            cleaned_lines.append(cleaned_line)
        elif in_multiline_comment and not original_line.strip().startswith('/*'):
            # Сохраняем пустую строку если была не комментарием
            cleaned_lines.append('')
    
    return '\n'.join(cleaned_lines)

def remove_css_comments(content):
    """Удаление CSS комментариев /* */"""
    # Удаляем CSS комментарии
    pattern = r'/\*.*?\*/'
    return re.sub(pattern, '', content, flags=re.DOTALL)

def clean_vue_file(file_path):
    """Очистка Vue файла от всех типов комментариев"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        original_size = len(content)
        
        # Разделяем на секции
        template_pattern = r'(<template.*?>)(.*?)(</template>)'
        script_pattern = r'(<script.*?>)(.*?)(</script>)'
        style_pattern = r'(<style.*?>)(.*?)(</style>)'
        
        # Обрабатываем template секцию
        template_match = re.search(template_pattern, content, re.DOTALL)
        if template_match:
            template_content = remove_html_comments(template_match.group(2))
            content = content.replace(template_match.group(2), template_content)
        
        # Обрабатываем script секции
        script_matches = re.finditer(script_pattern, content, re.DOTALL)
        for match in script_matches:
            script_content = remove_js_comments(match.group(2))
            content = content.replace(match.group(2), script_content)
        
        # Обрабатываем style секции
        style_matches = re.finditer(style_pattern, content, re.DOTALL)
        for match in style_matches:
            style_content = remove_css_comments(match.group(2))
            content = content.replace(match.group(2), style_content)
        
        # Удаляем избыточные пустые строки
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        new_size = len(content)
        size_reduced = original_size - new_size
        
        return content, size_reduced
        
    except Exception as e:
        print(f"❌ Ошибка обработки файла {file_path}: {str(e)}")
        return None, 0

def show_file_selector(files):
    """Интерактивный выбор файлов для обработки"""
    print("\n🎯 Найденные Vue файлы:")
    print("0️⃣  Все файлы")
    
    for i, file_path in enumerate(files, 1):
        file_size = os.path.getsize(file_path)
        print(f"{i}️⃣  {file_path} ({file_size:,} байт)")
    
    print("\n📝 Введите номера файлов через запятую (например: 1,3,5)")
    print("💡 Или нажмите Enter для обработки всех файлов")
    print("❌ Или введите 'q' для выхода")
    
    user_input = input("\n👉 Ваш выбор: ").strip()
    
    if user_input.lower() == 'q':
        return []
    
    if not user_input or user_input == '0':
        return files
    
    try:
        selected_indices = [int(x.strip()) for x in user_input.split(',')]
        selected_files = []
        
        for index in selected_indices:
            if 1 <= index <= len(files):
                selected_files.append(files[index - 1])
            else:
                print(f"⚠️  Неверный номер: {index}")
        
        return selected_files
        
    except ValueError:
        print("❌ Неверный формат ввода!")
        return []

def create_backup(file_path):
    """Создание резервной копии файла"""
    backup_path = f"{file_path}.backup"
    try:
        with open(file_path, 'r', encoding='utf-8') as original:
            with open(backup_path, 'w', encoding='utf-8') as backup:
                backup.write(original.read())
        return backup_path
    except Exception as e:
        print(f"⚠️  Не удалось создать бэкап для {file_path}: {str(e)}")
        return None

def main():
    """Основная функция скрипта"""
    print("🧹 COM Vue Comments Cleaner v1.0")
    print("=" * 50)
    print("📁 Поиск Vue файлов в текущей директории...")
    
    vue_files = find_vue_files()
    
    if not vue_files:
        print("❌ Vue файлы не найдены в текущей директории")
        return
    
    print(f"✅ Найдено {len(vue_files)} Vue файлов")
    
    # Выбор файлов для обработки
    selected_files = show_file_selector(vue_files)
    
    if not selected_files:
        print("👋 Завершение работы")
        return
    
    print(f"\n🚀 Начинаем обработку {len(selected_files)} файлов...")
    
    # Спрашиваем про создание бэкапов
    create_backups = input("\n💾 Создать резервные копии? (y/N): ").strip().lower() == 'y'
    
    total_size_reduced = 0
    processed_count = 0
    
    for file_path in selected_files:
        print(f"\n📝 Обрабатываем: {file_path}")
        
        # Создаем бэкап если нужно
        if create_backups:
            backup_path = create_backup(file_path)
            if backup_path:
                print(f"💾 Бэкап создан: {backup_path}")
        
        # Очищаем файл от комментариев
        cleaned_content, size_reduced = clean_vue_file(file_path)
        
        if cleaned_content is not None:
            # Записываем очищенный контент
            try:
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(cleaned_content)
                
                print(f"✅ Файл очищен! Удалено {size_reduced:,} символов")
                total_size_reduced += size_reduced
                processed_count += 1
                
            except Exception as e:
                print(f"❌ Ошибка записи файла: {str(e)}")
        else:
            print(f"❌ Файл пропущен из-за ошибки")
    
    # Итоговая статистика
    print("\n" + "="*50)
    print("📊 ИТОГИ ОЧИСТКИ:")
    print(f"✅ Обработано файлов: {processed_count}/{len(selected_files)}")
    print(f"🗑️  Общий размер удаленных комментариев: {total_size_reduced:,} символов")
    
    if total_size_reduced > 0:
        print(f"📉 Средняя экономия на файл: {total_size_reduced//processed_count:,} символов")
    
    print("\n🎉 Очистка комментариев завершена!")
    
    if create_backups:
        print("💡 Подсказка: для восстановления используйте .backup файлы")

if __name__ == "__main__":
    main()