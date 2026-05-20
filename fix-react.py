import os
import re

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace `import React from 'react';`
            content = re.sub(r'import\s+React\s+from\s+[\'"]react[\'"];?\n?', '', content)
            
            # Replace `import React, { ... } from 'react';`
            content = re.sub(r'import\s+React,\s*\{\s*(.*?)\s*\}\s+from\s+[\'"]react[\'"];?', r"import { \1 } from 'react';", content)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
