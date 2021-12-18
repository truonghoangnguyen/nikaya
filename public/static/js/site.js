$(document).ready(function () {

	// Variables
	var $codeSnippets = $('.code-example-body'),
		$nav = $('.navbar'),
		$body = $('body'),
		$window = $(window),
		$popoverLink = $('[data-popover]'),
		navOffsetTop = $nav.offset().top,
		$document = $(document),
		entityMap = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': '&quot;',
			"'": '&#39;',
			"/": '&#x2F;'
		},
		$muclucLink = $('[data-mucluc]');

	function init() {
		$window.on('scroll', onScroll)
		$window.on('resize', resize)
		$popoverLink.on('click', openPopover)
		$muclucLink.on('click', openMucluc)
		$document.on('click', closePopover)
		// $('a[href^="#"]').on('click', smoothScroll) ???
		buildSnippets();
		// init viewer
		var viewer = document.getElementById('content_frame');
		
		window.epubReader = new Epub(viewer);
		$('#viewNext').on('click', e=>{

			// +----------+ |
		    // |          | |
			// +----------+ |scrollTop    |
			// +----------+               |clientHeight 
			// |          |
			// |          | 
			// +----------+scrollHeight
			// epubReader.next(); 
			
			//var contentFrame = document.getElementById("content_frame");
			//epubReader.viewer.contentDocument.documentElement.scrollWidth
			let cw = epubReader.viewer.contentWindow,
				maxw = epubReader.viewer.contentDocument.documentElement.scrollWidth;
			// some calc result 0.xyz, so round number to 1 pixel
			let n = Math.floor(cw.pageXOffset + cw.innerWidth)+1;
			if (n < maxw){
				// contentFrame.contentDocument.documentElement.scrollWidth
				cw.scroll(n, 0);
			}
			else{
				// load next page
				epubReader.nextPage();
			}
		
		});
		$('#test').on('click', e=>{
			console.log($(epubReader.viewer).contents().height());
			var contentWindow = epubReader.viewer.contentWindow;
			contentWindow.scroll(contentWindow.pageXOffset + contentWindow.innerWidth, 0);
		});
		$('#viewBack').on('click', e=>{
			
			let cw = epubReader.viewer.contentWindow;
			if (cw.pageXOffset > 0){
				cw.scroll(cw.pageXOffset - cw.innerWidth, 0);
			}
			else{
				// load next page
				epubReader.prevPage(onLoadPartDone);

				function onLoadPartDone() {
					// then go to end of part
					let cw = epubReader.viewer.contentWindow,
						maxw = epubReader.viewer.contentDocument.documentElement.scrollWidth,
						page = Math.floor(maxw/cw.innerWidth);
					cw.scroll(page*cw.innerWidth, 0);

				}

				cw.scroll(cw.pageXOffset + cw.innerWidth, 0);
			}
		});

		$window.on('resize', function	(){ 
			setViewHeight();
		 });

		 
		// Setup view
		// var decorator = new IframeView();
		// decorator.setupView(this.viewer);
		viewer.addEventListener("load", ev => {
			const new_style_element = document.createElement("style");
			// new_style_element.textContent =  "body { font-family: 'EB Garamond', serif !important; font-size:22px !important; line-height: 6 !important; }"
			new_style_element.textContent = `
			html {
				overflow: hidden;
				direction: ltr !important;
				margin-top: 12px !important;
				-moz-column-width: 120mm !important;
				-webkit-column-width: 120mm !important;
				column-width: 120mm !important;
				-moz-column-count: auto !important;
				-webkit-column-count: auto !important;
				column-count: auto !important;
				-moz-column-fill: auto !important;
				-webkit-column-fill: auto !important;
				column-fill: auto !important;
				-moz-column-gap: 0px !important;
				-webkit-column-gap: 0px !important;
				column-gap: 0px !important;
				background-color: transparent !important;
			  }
			  body {
				margin-left: 0px !important;
				margin-right: 0px !important;
				font-size: 14pt !important;
				text-align: justify !important;
				padding-left: 6mm !important;
				padding-right: 6mm !important;
				background-color: transparent !important;
				font-family: 'EB Garamond', serif !important; 
				font-size:22px !important; 
				line-height: 6 !important; 
			  }
			  div,
			  span,
			  p,
			  ul,
			  li,
			  code,
			  pre,
			  a {
				-moz-hyphens: auto !important;
				-webkit-hyphens: auto !important;
				-ms-hyphens: auto !important;
				hypens: auto !important;
				font-size: 14pt !important;
				line-height: normal !important;
				background-color: transparent !important;
			  }
			  h1,
			  h2,
			  h3,
			  h4,
			  h5,
			  h6 {
				background-color: transparent !important;
			  }
			  img {
				max-width: 100% !important;
			  }
			`;
			ev.target.contentDocument.head.appendChild(new_style_element);

			const font = document.createElement("link");
			font.href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital@0;1&display=swap";
			font.rel="stylesheet"
			ev.target.contentDocument.head.appendChild(font)
			setViewHeight();

			//let h = epubReader.viewer.contentWindow.innerHeight-100 +'px';
			// epubReader.viewer.contentDocument.documentElement.style.height  = '200px';
			//epubReader.viewer.contentDocument.documentElement.style.height = h;
    		// console.log($(epubReader.viewer).contents().height());
			// epubReader.viewer.contentWindow.innerHeight
    		// console.log(h);epubReader.viewer.contentWindow.innerHeight-100 +'px'
    		// console.log(epubReader.viewer.contentWindow.innerHeight-100 +'px');
		});

		function setViewHeight() {
			let h = epubReader.viewer.contentWindow.innerHeight - 40 +'px';
			// epubReader.viewer.contentDocument.documentElement.style.height  = '200px';
			if (epubReader.viewer.contentDocument.documentElement) 
				epubReader.viewer.contentDocument.documentElement.style.height = h;
		}

		// var iframeWin = document.getElementById('content_frame').contentWindow;
		// $(iframeWin).on('resize', function	(){ 
		// 	let h = epubReader.viewer.contentWindow.innerHeight-100 +'px';
		// 	// epubReader.viewer.contentDocument.documentElement.style.height  = '200px';
		// 	if (epubReader.viewer.contentDocument.documentElement) 
		// 		epubReader.viewer.contentDocument.documentElement.style.height = h;
		//  });

		// viewer.contentWindow.addEventListener('resize', e=>{
		// 	let h = epubReader.viewer.contentWindow.innerHeight-100 +'px';
		// 	// epubReader.viewer.contentDocument.documentElement.style.height  = '200px';
		// 	epubReader.viewer.contentDocument.documentElement.style.height = h;
		// });
		
		listEBook();

		// test book view
		// epubReader.viewer.contentDocument.documentElement.style.height = '322px';
		// console.log($(epubReader.viewer).contents().height());
	}


	function smoothScroll(e) {
	    e.preventDefault();
	    $(document).off("scroll");
	    var target = this.hash,
	        menu = target;
	    $target = $(target);
	    $('html, body').stop().animate({
	        'scrollTop': $target.offset().top - 40
	    }, 0, 'swing', function () {
	        window.location.hash = target;
	        $(document).on("scroll", onScroll);
	    });
	}

	function openMucluc(e) {
		e.preventDefault()
		closePopover();
		var popover = $($(this).data('popover'));
		popover.toggleClass('open')
		e.stopImmediatePropagation();
	}

	function openPopover(e) {
		e.preventDefault()
		closePopover();
		var popover = $($(this).data('popover'));
		popover.toggleClass('open')
		e.stopImmediatePropagation();
	}

	function closePopover(e) {
		if ($('.popover.open').length > 0) {
			$('.popover').removeClass('open')
		}
	}

	$("#button").click(function () {
		$('html, body').animate({
			scrollTop: $("#elementtoScrollToID").offset().top
		}, 2000);
	});

	function resize() {
		$body.removeClass('has-docked-nav')
		navOffsetTop = $nav.offset().top
		onScroll()
	}

	function onScroll() {
		if (navOffsetTop < $window.scrollTop() && !$body.hasClass('has-docked-nav')) {
			$body.addClass('has-docked-nav')
		}
		if (navOffsetTop > $window.scrollTop() && $body.hasClass('has-docked-nav')) {
			$body.removeClass('has-docked-nav')
		}
	}

	function escapeHtml(string) {
		return String(string).replace(/[&<>"'\/]/g, function (s) {
			return entityMap[s];
		});
	}

	function buildSnippets() {
		$codeSnippets.each(function () {
			var newContent = escapeHtml($(this).html())
			$(this).html(newContent)
		})
	}

	function listEBook() {

		// <div class="one-third column book">
		// 	<div class="cover">
		// 		<a href="/books/duc-phat-lich-su/">
		// 			<img src="/books/kinh-trung-bo/cover.jpeg"/>
		// 		</a>
		// 	</div>
			
		// 	<a href="/books/duc-phat-lich-su/">
		// 		<h6 class="example-header">Đức Phật Lịch Sử</h6></a>
		// 	<p class="book-desc">H. W. Schumann là học giả người Ðức sinh năm 1928. Ông nghiên cứu ngành Ấn Ðộ học, các tôn giáo đối chiếu và nhân chủng xã hội học tại Ðại học Bonn (Ðức). Ông nhận rằng tiến sĩ năm 1957 với luận án Triết học phật giáo. Từ 1960 đến 1963 ông là giảng sư Ðại học Ấn Ðộ ở Benares, Ấn Ðộ. Năm 1963 ông tham gia công tác Bộ Ngoại giao và lãnh sự Cộng hòa liên bang Ðức, phục vụ ngành ngoại giao và lãnh sự của Tây Ðức tại Calcutta (Ấn), Rangoon (Miến), Chicago (Mỹ) và Colombo (Srilanka).
		// 	</p>
		// </div>
		
		// -row 1
		// [][][]
		// -row 2
		// [][][]
		let bookDiv = $('#books'),
			bookRow = $('<div>', {class: 'row'}),
			count = 0;

		for(let x of booksList) {
			let book = $('<div>', {class: 'one-third column book'}).append(
							$('<div>', {class:'cover'}).append(
						 		$('<a>', { href: x.path}).append(
									$('<img>', { src: x.path+'/'+x.cover})
						  		)
						 	) 
				        ).append(
						 	$('<a>', { href: x.path}).append(
						  		$('<h5>', {text:x.name, class:'title'})	
						 	)
						).append(
							$('<p>', {text:x.desc})
						);
                  
			bookRow.append(book);
			count ++;

			if (count % 3 == 0){
				bookDiv.append(bookRow);
				bookRow = $('<div>', {class: 'row'});
			}
		}
		bookDiv.append(bookRow);
	}

	init();
	router();
});


/**
 * / : home
 * /books/ : home
 * /books/* : reading book
 * 
 */
function router() {
	// window.location.pathname = “/example/index.html”
	// window.location.search = “?s=flexbox”
	let path = window.location.pathname;
	
	// in: '/books/kinh-trung-bo/index_split_008.html.se'
	// out: Array ["books", "kinh-trung-bo", "index_split_008.html.se"]
	const re = /[a-z0-9\-_.]+/g
	let rePaths = path.match(re);
	// check if valid router
	if (!rePaths) return;
	switch(rePaths.length ){
		case 0:
			break;
		case 1:
			break;
		case 2:
		case 3:
			// view first part of books
			let bookpath = "/"+rePaths[0]+"/"+rePaths[1];
			let page = undefined;
			if (rePaths[2]) page = rePaths[2];
			epubReader.setPath(bookpath);
			epubReader.view(cbViewMucluc, page);
			return;
		
		default:
			; // 
	}
}

/**
 * after open book, UI show mucluc
 * TODO: 
 */
function cbViewMucluc(){

	function removeAnchorHtmlPart(part) {
		if (part.lastIndexOf('#') >= 0){
			return part.substr(0, part.lastIndexOf('#'));
		}
		return part;
	}
	
	var ul = $("#muclucItem"),
	 	pointsToc = epubReader.pointsToc,
		htmlPartCounter = 0,
		currHtmlPart = removeAnchorHtmlPart(pointsToc[0]['content']);

	for (let i = 0; i < pointsToc.length; i++) {
		let p = removeAnchorHtmlPart(pointsToc[i]['content']);
		if (p !== currHtmlPart){
			currHtmlPart = p;
			htmlPartCounter ++;
		}

		let li = $('<li>', {class: 'popover-item'})
			.append($('<a>', { 
				class   :'popover-link',
				href	: epubReader.path+'/'+pointsToc[i]['content'],  	
				text	: pointsToc[i]['label'],
				'book-index': htmlPartCounter,
				click	: function(ev) {
					// seek to current part or load new part
					try{
						let idx = parseInt($(this).attr('book-index'));
						// this html part is current loaded 
						if(epubReader.position === idx){
							// get anchor #: '/books/duc-phat-lich-su/index_split_000.html#p15.se'
							let href=$(this).attr('href'),
								anchor = epubReader.getAnchor(href);
							
							if (anchor){
								let cw = epubReader.viewer.contentWindow,
									top = cw.document.getElementById(anchor).offsetTop,
									page = Math.floor(top/cw.innerWidth);
								cw.scroll(page*cw.innerWidth, 0);
								// cw.scroll(3*cw.innerWidth, 0);
								return false; // prevent click 
							}
							else;// do nothing
						}
						else{; // do nothing, do normal href
						}
					}
					catch{; // pass, do normal href
					}
				}
			}));
		ul.append(li)
	}

	// view book-control menu
	$('.book-control').toggleClass('active');
}

/**
 * Lisf of books
 */
var booksList = [{
		name: "Kinh Trung Bộ",
		path: "/books/kinh-trung-bo",
		cover: "cover.jpeg",
		desc: "Kinh Trung Bộ"
	},{
		name: "Đức Phật Lịch Sử",
		path: "/books/duc-phat-lich-su",
		cover: "index-1_1.jpg",
		desc: "Kinh Trung Bộ"
	}
]