
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

	$(window).on("beforeunload", function () {
		localStorage.setItem("nguyen", "a");
		if (epubView.epub.isOpen()) {
			epubView.saveLastView();
		}
	});

	$window.on('resize', function () {
		if (epubView.epub.isOpen()) {
			resizeEpubView();
		}
	});


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
		var iframe = document.getElementById('content_frame');
		window.epubView = new EpubView(iframe);

		$('#viewNext').on('click', e => {
			epubView.nextPage();
		});
		$('#test').on('click', e => {
			testCFI();
		});
		$('#viewBack').on('click', e => {
			epubView.prevPage();
		});
		$('#greyBook').on('click', e => {
			$(viewer.contentDocument.body).toggleClass('greyBook');
		});
		$('#incFont').on('click', e => {
			zoomBook(4);
		});
		$('#decFont').on('click', e => {
			zoomBook(-4);
		});
		$('#fullscreen').on('click', e => {
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

		listEBook();
		document.addEventListener('keydown', epubView.onKeyBoard);
	}
	///////////////////////////////////////////

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
	switch (rePaths.length) {
		case 0:
		case 1:
			if (epubViewer.epub.isOpen()) {
				epubViewer.epub.close();
			}
			showBookList();
			break;
		case 2:
		case 3:
			// view first part of books
			let bookpath = "/" + rePaths[0] + "/" + rePaths[1];
			let page = undefined;
			if (rePaths[2]) {
				page = rePaths[2];
			}
			epubView.setPath(bookpath);
			epubView.initBook().then(() => { afterOpenBook(page); });
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
function afterOpenBook(page = undefined) {
	// save opened book
	epubView.saveBookOpened();
	// update title
	document.title = epubView.epub.toc.ncx.docTitle.text;
	// after init book, we read first page or last opened page
	epubView.readPage(page, _afterFistView);

	function _afterFistView() {
		// add event when user clieck menu, close menu
		$(epubView.iframe.contentWindow.document).on('click', function (event) {
			if ($('.popover.open').length > 0) {
				$('.popover').removeClass('open')
			}
		});
	}

	function _removeAnchorHtmlPart(part) {
		if (part.lastIndexOf('#') >= 0) {
			return part.substr(0, part.lastIndexOf('#'));
		}
		return part;
	}

	var ul = $("#muclucItem"),
		pointsToc = epubView.epub.toc.ncx.navMap.navPoint,
		htmlPartCounter = 0,
		currHtmlPart = _removeAnchorHtmlPart(pointsToc[0]['content']['_src']);

	for (let i = 0; i < pointsToc.length; i++) {
		let p = _removeAnchorHtmlPart(pointsToc[i]['content']['_src']);
		if (p !== currHtmlPart) {
			currHtmlPart = p;
			htmlPartCounter++;
		}

		let li = $('<li>', { class: 'popover-item' })
			.append($('<a>', {
				class: 'popover-link',
				href: Epub.addPlusExt(epubView.epub.path + '/' + pointsToc[i]['content']['_src']),
				text: pointsToc[i]['navLabel']['text'],
				'book-index': htmlPartCounter,
				click: function (ev) {
					// seek to current part or load new part
					try {
						let idx = parseInt($(this).attr('book-index'));
						// this html part is current loaded 
						if (epubViewer.epub.position === idx) {
							// get anchor #: '/books/duc-phat-lich-su/index_split_000.html#p15.se'
							let href = $(this).attr('href'),
								anchor = Epub.getAnchor(href);

							if (anchor) { // scroll to page
								let cw = epubView.iframe.contentWindow,
									top = cw.document.getElementById(anchor).offsetTop,
									page = Math.floor(top / cw.innerWidth);
								cw.scroll(page * cw.innerWidth, 0);
								// cw.scroll(3*cw.innerWidth, 0);
								return false; // prevent click action
							}
							else;// do nothing
						}
						else {
							; // do nothing, do normal href
						}
					}
					catch {
						; // pass, do normal href
					}
				}
			}));
		ul.append(li)
	}

	// view book-control menu
	$('.book-control').toggleClass('active');
}

/**
 * show list of ebook
 */
function listEBook() {
	// reorder books
	let bookOpeded = epubView.listBookOpeded();

	/**
	 * show lasted opened book
	 */
	function _reorderBooks() {
		let booksOrdered = [];
		let booksNotRead = booksList.slice();
		// 1/2: get all book on read
		for (let e of bookOpeded) {
			booksOrdered.push(booksList[e]);
			booksNotRead.splice(e, 1);
		}
		booksOrdered.push(...booksNotRead);

		return booksOrdered;
	}

	let bookshow = _reorderBooks();

	let bookDiv = $('#books'),
		bookRow = $('<div>', { class: 'row' }),
		count = 0;

	for (let x of bookshow) {
		let book = $('<div>', { class: 'one-third column book' }).append(
			$('<div>', { class: 'cover' }).append(
				$('<a>', { href: x.path }).append(
					$('<img>', { src: x.path + '/' + x.cover })
				)
			)
		).append(
			$('<a>', { href: x.path }).append(
				$('<h1>', { text: x.name, class: 'title' })
			)
		);
		bookRow.append(book);
		count++;

		if (count % 3 == 0) {
			bookDiv.append(bookRow);
			bookRow = $('<div>', { class: 'row' });
		}
	}
	bookDiv.append(bookRow);
}

/////////
function testCFI() {
	epubView.saveLastView();
}