import os
from datetime import datetime
import xml.etree.ElementTree as ET
import xml.dom.minidom as minidom

def generate_sitemap():
    # Create the root element
    urlset = ET.Element('urlset')
    urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    
    # Add homepage
    home_url = ET.SubElement(urlset, 'url')
    ET.SubElement(home_url, 'loc').text = 'https://nikaya.web.app/'
    ET.SubElement(home_url, 'lastmod').text = datetime.now().strftime('%Y-%m-%d')
    ET.SubElement(home_url, 'changefreq').text = 'weekly'
    ET.SubElement(home_url, 'priority').text = '1.0'
    
    # Walk through the books directory
    books_dir = 'public/books'
    for root, dirs, files in os.walk(books_dir):
        for file in files:
            # Only include .html files and skip .html.se files
            if file.endswith('.html') and not file.endswith('.html.se'):
                # Get the relative path from books_dir
                rel_path = os.path.relpath(os.path.join(root, file), 'public')
                url = ET.SubElement(urlset, 'url')
                
                # Construct the full URL
                full_url = f'https://nikaya.web.app/{rel_path}'
                ET.SubElement(url, 'loc').text = full_url
                ET.SubElement(url, 'lastmod').text = datetime.now().strftime('%Y-%m-%d')
                ET.SubElement(url, 'changefreq').text = 'monthly'
                ET.SubElement(url, 'priority').text = '0.8'
    
    # Create the XML string with proper formatting
    xml_str = minidom.parseString(ET.tostring(urlset)).toprettyxml(indent='   ')
    
    # Write to sitemap.xml
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(xml_str)

if __name__ == '__main__':
    generate_sitemap()
