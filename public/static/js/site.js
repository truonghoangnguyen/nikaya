
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
		$window.on('scroll', onScroll);
		$window.on('resize', resize);
		$popoverLink.on('click', openPopover);
		// $muclucLink.on('click', openMucluc);
		$document.on('click', closePopover);
		$('.navbar-item').on('click', closePopover);
		
		// $('a[href^="#"]').on('click', smoothScroll) ???
		buildSnippets();
		// init viewer
		var viewer = document.getElementById('content_frame');
		
		viewer.contentDocument.body.addEventListener('mouseup', onKeyBoard);
		document.addEventListener('keydown', onKeyBoard);
		
		window.epubReader = new Epub(viewer);

		$('#viewNext').on('click', e=>{
			_nextPage();
		});
		$('#test').on('click', e=>{
			$('.loader').toggleClass('open')
		});
		$('#viewBack').on('click', e=>{
			_prevPage();
		});
		$('#greyBook').on('click', e=>{
			$(viewer.contentDocument.body).toggleClass('greyBook');
		});
		$('#incFont').on('click', e=>{
			zoomBook(4);
		});
		$('#decFont').on('click', e=>{
			zoomBook(-4);
		});
		$('#fullscreen').on('click', e=>{
			let elem = document.body;
			// ## The below if statement seems to work better ## if ((document.fullScreenElement && document.fullScreenElement !== null) || (document.msfullscreenElement && document.msfullscreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
			if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
				if (elem.requestFullScreen) {
					elem.requestFullScreen();
				} else if (elem.mozRequestFullScreen) {
					elem.mozRequestFullScreen();
				} else if (elem.webkitRequestFullScreen) {
					elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
				} else if (elem.msRequestFullscreen) {
					elem.msRequestFullscreen();
				}
			} else {
				if (document.cancelFullScreen) {
					document.cancelFullScreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
				} else if (document.msExitFullscreen) {
					document.msExitFullscreen();
				}
			}
		});
		$window.on('resize', function(){ 
			if (epubReader.isOpen()){
				resizeEpubView();
			}
		});

		listEBook();
		onKeyBoard();
		viewer.addEventListener("load", ev => {initIframeView(ev)});
		
		// Zoom function
        function _zoom_page(step, trigger)
        {
			var zoom_level=100;
            // Zoom just to steps in or out
            if(zoom_level>=120 && step>0 || zoom_level<=80 && step<0) return;

            // Set / reset zoom
            if(step==0) zoom_level=100;
            else zoom_level=zoom_level+step;

            // Set page zoom via CSS
            $('body').css({
                transform: 'scale('+(zoom_level/100)+')', // set zoom
                transformOrigin: '50% 0' // set transform scale base
            });

            // Adjust page to zoom width
            if(zoom_level>100) $('body').css({ width: (zoom_level*1.2)+'%' });
            else $('body').css({ width: '100%' });

            // Activate / deaktivate trigger (use CSS to make them look different)
            if(zoom_level>=120 || zoom_level<=80) trigger.addClass('disabled');
            else trigger.parents('ul').find('.disabled').removeClass('disabled');
            if(zoom_level!=100) $('#zoom_reset').removeClass('disabled');
            else $('#zoom_reset').addClass('disabled');
        }

		
		function _nextPage() {
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
				$('.loader').toggleClass('open');
				epubReader.nextPage(()=>{$('.loader').toggleClass('open')});
			}
		}
	
		function _prevPage() {
			let cw = epubReader.viewer.contentWindow;
			if (cw.pageXOffset > 0){
				cw.scroll(cw.pageXOffset - cw.innerWidth, 0);
			}
			else{
				// load next page
				$('.loader').toggleClass('open');
				epubReader.prevPage(onLoadPartDone);
	
				function onLoadPartDone() {
					// then go to end of part
					let cw = epubReader.viewer.contentWindow,
						maxw = epubReader.viewer.contentDocument.documentElement.scrollWidth,
						page = Math.floor(maxw/cw.innerWidth);
					cw.scroll(page*cw.innerWidth, 0);
					$('.loader').toggleClass('open');
				}
	
				cw.scroll(cw.pageXOffset + cw.innerWidth, 0);
			}
		}
	
		function onKeyBoard(event) {
			if (!epubReader.isOpen()){
				return;
			}
			if((event.shiftKey && event.key === ' ') || event.key === 'ArrowLeft'){
				_prevPage();
			}
			else if((event.key === ' ') || (event.key === 'ArrowRight')){
				_nextPage();
			}
		}
		// 	/**
		// 	 * Keyboard event, next, back
		// 	 */
		// 	document.addEventListener('keydown', function (event) {
		// 		if (!epubReader.isOpen()){
		// 			return;
		// 		}
		// 		if((event.shiftKey && event.key === ' ') || event.key === 'ArrowLeft'){
		// 			_prevPage();
		// 		}
		// 		else if((event.key === ' ') || (event.key === 'ArrowRight')){
		// 			_nextPage();
		// 		}
		// 	});
		// 	epubReader.viewer.conte
		// }
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

	// function openMucluc(e) {
	// 	e.preventDefault()
	// 	closePopover();
	// 	var popover = $($(this).data('popover'));
	// 	popover.toggleClass('open')
	// 	e.stopImmediatePropagation();
	// }

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
						  		$('<h1>', {text:x.name, class:'title'})	
						 	)
						);
						// .append(
						// 	$('<p>', {text:x.desc})
						// );
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
		case 1:
			if(epubReader.isOpen()){ 
				epubReader.close();
			}
			showBookList();
			break;
		case 2:
		case 3:
			// view first part of books
			let bookpath = "/"+rePaths[0]+"/"+rePaths[1];
			let page = undefined;
			if (rePaths[2]) page = rePaths[2];
			epubReader.setPath(bookpath);
			// epubReader.view(afterOpenBook, page);
			epubReader.openBook().then(()=>{afterOpenBook(page);});
			// epubReader.open_content_opf(afterOpenBook, page);
			hideBookList();
			return;
		
		default:
			; // 
	}

	function hideBookList() {
		$('#books').addClass('hide');
	
	}
	function showBookList() {
		$('#books').addClass('show');		
	}

}

/**
 * callback after open a book, view mucluc and control
 * @param {*} page 
 */
function afterOpenBook(page){
	// update title
	document.title = epubReader.toc.ncx.docTitle.text;
	// read first page
	epubReader.readItem(page, function(){
		// close menu
		$(epubReader.viewer.contentWindow.document).on('click', function(event){
			if ($('.popover.open').length > 0) {
				$('.popover').removeClass('open')
			}
		});
	});	

	function _removeAnchorHtmlPart(part) {
		if (part.lastIndexOf('#') >= 0){
			return part.substr(0, part.lastIndexOf('#'));
		}
		return part;
	}
	
	var ul = $("#muclucItem"),
	 	pointsToc = epubReader.toc.ncx.navMap.navPoint,
		htmlPartCounter = 0,
		currHtmlPart = _removeAnchorHtmlPart(pointsToc[0]['content']['_src']);

	for (let i = 0; i < pointsToc.length; i++) {
		let p = _removeAnchorHtmlPart(pointsToc[i]['content']['_src']);
		if (p !== currHtmlPart){
			currHtmlPart = p;
			htmlPartCounter ++;
		}

		let li = $('<li>', {class: 'popover-item'})
			.append($('<a>', { 
				class   :'popover-link',
				href	: epubReader.addPlusExt(epubReader.path+'/'+pointsToc[i]['content']['_src']),  	
				text	: pointsToc[i]['navLabel']['text'],
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
							
							if (anchor){ // scroll to page
								let cw = epubReader.viewer.contentWindow,
									top = cw.document.getElementById(anchor).offsetTop,
									page = Math.floor(top/cw.innerWidth);
								cw.scroll(page*cw.innerWidth, 0);
								// cw.scroll(3*cw.innerWidth, 0);
								return false; // prevent click action
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

