import os

def add_script_to_html_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check if script is already added
                if 'inject.js' not in content:
                    # Find the closing head tag
                    head_close_pos = content.find('</head>')
                    if head_close_pos != -1:
                        # Calculate the relative path to inject.js
                        rel_path = os.path.relpath(os.path.join(directory, 'inject.js'), 
                                                os.path.dirname(file_path))
                        # Add script tag before closing head
                        script_tag = f'<script src="{rel_path}"></script>\n'
                        content = content[:head_close_pos] + script_tag + content[head_close_pos:]
                        
                        # Write the modified content back
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                            print(f'Added script to {file_path}')

if __name__ == '__main__':
    books_dir = 'public/books'
    add_script_to_html_files(books_dir)
