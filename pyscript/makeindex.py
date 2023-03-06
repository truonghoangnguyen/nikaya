html_doc = """
<html><head><title>The Dormouse's story</title></head>
<body>
<p class="title"><b>The Dormouse's story</b></p>

<p class="story">Once upon a time there were three little sisters; and their names were
<a href="http://example.com/elsie" class="sister" id="link1">Elsie</a>,
<a href="http://example.com/lacie" class="sister" id="link2">Lacie</a> and
<a href="http://example.com/tillie" class="sister" id="link3">Tillie</a>;
and they lived at the bottom of a well.</p>

<p class="story">...</p>
Đặt bẫy, Kiên nhẫn và chờ đợi
PS D:\project\nikaya> python .\makeindex.py
"""

html_head = """
<!DOCTYPE html>
<html lang="en">

<head>
</head>
<body>
"""
html_tail = """
</body>
</html>
"""

import os
from bs4 import BeautifulSoup
soup = BeautifulSoup(html_doc, 'html.parser')

root = './../public/books/'
book_intro = [
	
		{"./../public/books/duc-phat-lich-su":[{"h1":None}]},
		{"./../public/books/kinh-tang-chi-bo":[{'b': {"class":"calibre4"}}, {'b':{"class":"calibre3"}}]},
		{"./../public/books/kinh-tieu-bo-t1":[{"h1":None}, {"h2":None}, {"h3":None}]},
		{"./../public/books/kinh-tieu-bo-t2":[{"h1":None}, {"h2":None}, {"h3":None}]},
		{"./../public/books/kinh-tieu-bo-t3":[{"h1":None}, {"h2":None}, {"h3":None}]},
		{"./../public/books/kinh-tieu-bo-t4":[{"h1":None}, {"h2":None}, {"h3":None}]},
		{"./../public/books/kinh-trung-bo":[{"h1":None}, {"h2":None}, {"h3":None}]},
		{"./../public/books/kinh-truong-bo":[{"h1":None}, {"h2":None}, {"h3":None}]},
		{"./../public/books/kinh-tuong-ung-bo":[{"h1":None}, {"h2":None}, {"h3":None}]}
]
index = open("./../public/bookindex.html", "w", encoding="utf-8")
index.writelines(html_head)
for bookin in book_intro:
	#book = os.listdir(path=bookdir)
	for bookdir in bookin:
		book = os.listdir(path=bookdir)
		s0 = str('<h1><a href="'+bookdir[11:]+'">' + bookdir[18:] +'</a></h1> \r')
		index.writelines(s0)
		read_intro = bookin.get(bookdir)
		# goto the book
		for f in book:
			ext = os.path.splitext(f)[-1].lower()
			if ext == ".html":
				file_empty = True
				with open(bookdir+'/'+f, encoding="utf8") as fp:
					soup = BeautifulSoup(fp, 'html.parser')
					for ri in read_intro:
						for k in ri:
							if ri.get(k):
								find_ri = soup.find_all(k, ri.get(k))
							else:
								find_ri = soup.find_all(k)
							# https://nikaya.web.app/books/kinh-tieu-bo-t2/index_split_020.html.se
							if find_ri:
								file_empty = False
								# index.writelines(" "+f+"</br>\r")
								for ri in find_ri:
									if ri.text.strip() != '':
										s = str('<a href="'+bookdir[11:]+"/"+f+'.se">' +ri.text +'</a>')
										index.writelines(s+"</br>\r")
				if file_empty == False:
					pass
					# index.writelines(":: not found index ::"+f+"</br>\r")
		#print(bookin.get(bookdir))
		#for f in book:
		#	print(f)
			# print(f)
			#ext = os.path.splitext(f)[-1].lower()
			# print(root+bookdir+'/'+f)
			#if ext == ".html":
				# with open(bookdir+'/'+f, encoding="utf8") as fp:
				# 	soup = BeautifulSoup(fp, 'html.parser')
				# 	all_h1 = soup.find_all('h1')
				# 	if all_h1:
				# 		index.writelines(" "+f+"\r")
					
				# 	for h1 in all_h1:
				# 		#print(h1.text)
				# 		s = str("  "+h1.text )
				# 		#print(s)
				# 		index.writelines(s+"\r")

index.writelines(html_tail)
index.close()
"""
booksdir = os.listdir(path=root)
index = open("./../bookindex.html", "w", encoding="utf-8")

for bookdir in booksdir:
	book = os.listdir(path=root+bookdir)
	index.writelines(bookdir+"\r")
	print(bookdir)
	for f in book:
		# print(f)
		ext = os.path.splitext(f)[-1].lower()
		# print(root+bookdir+'/'+f)
		if ext == ".html":
			#print(root+bookdir+'/'+f)
			with open(root+bookdir+'/'+f, encoding="utf8") as fp:
				soup = BeautifulSoup(fp, 'html.parser')
				all_h1 = soup.find_all('h1')
				if all_h1:
					index.writelines(" "+f+"\r")
				
				for h1 in all_h1:
					#print(h1.text)
					s = str("  "+h1.text )
					#print(s)
					index.writelines(s+"\r")

index.close()
"""		
		#print(ext)

# print(soup.prettify())
# for f in folder:
# 	for file in f:
# 		if f is html:
# 			soup = BeautifulSoup(html_doc, 'html.parser')
# 			to_index = toindex(soup)
# 			index.add(to_index)
# 			index.save_to_file()
