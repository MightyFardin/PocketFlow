import os
import re

dir_path = 'src'
for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.jsx'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find all classNames containing fixed inset-0
            # Replace bg-slate-*/* and dark:bg-black/* with bg-transparent backdrop-blur-sm
            def replace_overlay(match):
                class_str = match.group(1)
                if 'fixed inset-0' in class_str:
                    # Remove all background dimming classes
                    class_str = re.sub(r'bg-slate-\d+/\d+', '', class_str)
                    class_str = re.sub(r'dark:bg-black/\d+', '', class_str)
                    class_str = re.sub(r'dark:bg-slate-\d+/\d+', '', class_str)
                    
                    # Also ensure we don't have multiple bg-transparent or backdrop-blur-sm
                    class_str = re.sub(r'bg-transparent', '', class_str)
                    class_str = re.sub(r'backdrop-blur-sm', '', class_str)
                    
                    # Re-add them cleanly after fixed inset-0
                    class_str = class_str.replace('fixed inset-0', 'fixed inset-0 bg-transparent backdrop-blur-sm')
                    
                    # Clean up double spaces
                    class_str = re.sub(r'\s+', ' ', class_str).strip()
                    
                return f'className="{class_str}"'
            
            new_content = re.sub(r'className="([^"]+)"', replace_overlay, content)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file_path}")

