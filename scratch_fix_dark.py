import os
import glob
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix dark backgrounds
    new_content = content.replace('bg-slate-950/60', 'bg-white/60')
    new_content = new_content.replace('bg-slate-900/40', 'bg-white/80')
    new_content = new_content.replace('text-slate-100', 'text-slate-900')
    new_content = new_content.replace('text-[#a4c9ff]', 'text-primary')
    new_content = new_content.replace('shadow-blue-500/5', 'shadow-slate-300/30')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for filepath in glob.glob('frontend/src/**/*.tsx', recursive=True):
    replace_in_file(filepath)
