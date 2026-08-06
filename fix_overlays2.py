import os
import re

dir_path = 'src'
for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.jsx'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            def replace_overlay(match):
                class_str = match.group(1)
                if 'fixed inset-0' in class_str:
                    # Remove bg-transparent and backdrop-blur-sm
                    class_str = re.sub(r'bg-transparent', '', class_str)
                    class_str = re.sub(r'backdrop-blur-sm', '', class_str)
                    
                    # Add standard subtle dimming
                    class_str = class_str.replace('fixed inset-0', 'fixed inset-0 bg-slate-900/20 dark:bg-black/40')
                    
                    # Clean up double spaces
                    class_str = re.sub(r'\s+', ' ', class_str).strip()
                    
                return f'className="{class_str}"'
            
            new_content = re.sub(r'className="([^"]+)"', replace_overlay, content)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file_path}")

