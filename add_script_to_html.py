import os
from bs4 import BeautifulSoup

def add_script_to_html_files(directory):
    # Walk through all files in directory
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                
                # Read the HTML file
                with open(file_path, 'r', encoding='utf-8') as f:
                    soup = BeautifulSoup(f, 'xml')
                
                # Check if script already exists
                script_tag = soup.find('script', {'src': '../page_script.js'})
                if not script_tag:
                    # Create new script tag
                    new_script = soup.new_tag('script', src='../page_script.js')
                    
                    # Add it to head
                    head = soup.find('head')
                    if head:
                        head.append(new_script)
                    
                    # Write the modified HTML back to file
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(str(soup))
                        
if __name__ == '__main__':
    books_dir = 'public/books'
    add_script_to_html_files(books_dir)
