import os
import glob
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace white/ with black/ for our standard opacity classes
    new_content = re.sub(r'bg-white/(\d+)', r'bg-slate-900/\1', content)
    new_content = new_content.replace('bg-white/5', 'bg-slate-900/5')
    new_content = re.sub(r'border-white/(\d+)', r'border-slate-900/\1', new_content)
    new_content = re.sub(r'border-white/5', r'border-slate-900/5', new_content)
    new_content = re.sub(r'text-white/(\d+)', r'text-slate-900/\1', new_content)
    new_content = re.sub(r'divide-white/(\d+)', r'divide-slate-900/\1', new_content)
    
    # Text colors
    new_content = new_content.replace('text-white', 'text-slate-900')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for filepath in glob.glob('frontend/src/**/*.tsx', recursive=True):
    replace_in_file(filepath)
