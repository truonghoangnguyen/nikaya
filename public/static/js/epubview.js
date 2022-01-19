// call after open a book
function initIframeView(ev) {
	const new_style_element = document.createElement("style");
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
	@media (max-device-width: 480px) {
		html {
			/* styles for mobile browsers smaller than 480px; (iPhone) */
			overflow: scroll !important;
			padding-bottom: 16px
		}
	}
	.greyBook {
		background-image: url("/static/css/grey.png");
	}
	.greyBook,
	.greyBook span,
	.greyBook a,
	.greyBook a span,
	.greyBook p,
	.greyBook h1,
	.greyBook h2,
	.greyBook h3,
	.greyBook h4,
	.greyBook h5,
	.greyBook h6,
	.greyBook .h1,
	.greyBook .h2,
	.greyBook .h3,
	.greyBook .h4,
	.greyBook .h5,
	.greyBook .h6 {
	color: #ccc !important;
	}
	.greyBook a {
	color: #e0e0e0 !important;
	}
		
	`;

	ev.target.contentDocument.head.appendChild(new_style_element);

	const font = document.createElement("link");
	font.href = "https://fonts.googleapis.com/css2?family=EB+Garamond:ital@0;1&display=swap";
	font.rel = "stylesheet"
	ev.target.contentDocument.head.appendChild(font)

	//ev.target.contentDocument = html loaded in iframe 
	$(ev.target.contentDocument.body).addClass('greyBook');
	resizeEpubView();

}


function resizeEpubView() {
	// iframe innerHeight
	// for setting iframe heigth 
	let h = epubView.iframe.contentWindow.innerHeight - 40 + 'px'; //ng1
	if (epubView.iframe.contentDocument.documentElement)
		epubView.iframe.contentDocument.documentElement.style.height = h;
}
var currZoom = 100;
function zoomBook(step) {
	if (false) {//$.browser.mozilla){
		//var step = 0.02;
		currFFZoom += step;
		$('body').css('MozTransform', 'scale(' + currFFZoom + ')');
	} else {
		currZoom += step;
		$(epubView.iframe.contentDocument.body).css('zoom', ' ' + currZoom + '%');
	}

}
//////////

/**
 * View control
 */
class EpubView {
	constructor(iframe) {
		this.iframe = iframe;
		this.iframe.addEventListener("load", ev => { initIframeView(ev) });
		// for page control
		this.pageXOffset = 0; // top-left of view
		this.lastPart = null; // last part of book viewed
		this.epub = new Epub();
		this.allowMove = true;
	}
	setPath(path) {
		this.epub.setPath(path);
	}
	initBook() {
		return this.epub.initBook();
	}

	/**
	 * read next item in
	 */
	goItem(val, onLoadPartDone) {
		let position = this.epub.position + (1 * val);
		let item = this.epub.gotoItem(position);
		this._showItem(item, onLoadPartDone);
	}
	/**
	 * read a part of book
	 */
	readPage(page, onLoadPartDone) {
		page = Epub.removePlusExt(page);
		var scroll = -1,
			me = this;
		// saved book or new book
		if (!page) {
			let saved = EpubView.getLastView(this.epub.path);
			if (saved) {
				page = saved['part']['_href'];
				scroll = saved['x'];
			}
		}
		let position = this.epub.hrefToIndex(page);
		let item = this.epub.gotoItem(position);
		this._showItem(item, onLoadPartDone, scroll);

	}

	_showItem(item, onLoadPartDone = undefined, scroll = -1) {
		this.allowMove = false;
		//this.viewItem(point, onLoadPartDone);
		// begin view item
		let uraw = this.epub.path + "/" + item['_href'];
		console.log(uraw);
		history.pushState({}, '', Epub.addPlusExt(uraw));
		let url = Epub.removePlusExt(uraw);
		$('.loader').addClass('open');
		this.iframe.src = url;


		// setup viewer, after load done, update View
		$(this.iframe).addClass('open'); // show viewer iframe

		// callback when load done
		var me = this;
		$(this.iframe).on('load', e => {
			if (onLoadPartDone) {
				onLoadPartDone();
			}
			$(this.iframe).unbind('load');

			// scrool if required
			if (scroll != -1) {
				me._scroll(scroll);
			}
			me.allowMove = true;
			$('.loader').removeClass('open');
		});
		this.lastPart = item;
	}


	/**
	 * 
	 * @returns list of index of opened book
	 */
	listBookOpeded() {
		let stored = localStorage.getItem("indexOffBookOnRead");
		stored = JSON.parse(stored) || [];
		return stored;
	}
	/**
	 * save opened book
	 */
	saveBookOpened() {
		let stored = this.listBookOpeded();

		for (let [i, e] of booksList.entries()) {
			if (e.path === this.epub.path) {
				// check for if index in list
				for (let [j, s] of stored.entries()) {
					if (s === i) {
						stored.splice(j, 1);
						break;
					}
				}
				stored.unshift(i);

				localStorage.setItem("indexOffBookOnRead", JSON.stringify(stored));
				console.log(JSON.stringify(stored));
				break;
			}
		}
	}

	static getLastView(path) {
		let booksLastView = JSON.parse(localStorage.getItem("booksLastView")) || [];
		for (const e of booksLastView) {
			if (e['path'] === path) {
				return e;
			}
		}
		return null;
	}

	/**
	 * save last view of a book
	 */
	saveLastView() {
		if (!this.lastPart) return;

		let booksLastView = JSON.parse(localStorage.getItem("booksLastView")) || [];
		let isnew = true;
		for (const e of booksLastView) {
			if (e['path'] === epubView.epub.path) {
				e['x'] = this.pageXOffset;
				e['part'] = this.lastPart;
				isnew = false;
				break;
			}
		}
		if (isnew) {
			let last = {
				path: this.epub.path,
				part: this.lastPart,
				x: this.pageXOffset
			}
			booksLastView.push(last);
		}

		localStorage.setItem("booksLastView", JSON.stringify(booksLastView))
	}

	/**
	 * on book keyboard ctr
	 * @param {*} event 
	 * @returns 
	 */
	onKeyBoard(event) {
		if (!epubView.epub.isOpen()) {
			return;
		}
		if ((event.shiftKey && event.key === ' ') || event.key === 'ArrowLeft') {
			epubView.prevPage();
		}
		else if ((event.key === ' ') || (event.key === 'ArrowRight')) {
			epubView.nextPage();
		}
	}

	_scroll(x) {
		this.pageXOffset = x;
		this.iframe.contentWindow.scroll(this.pageXOffset, 0);
	}


	prevPage() {
		if (!this.allowMove) return;

		let cw = this.iframe.contentWindow;
		if (cw.pageXOffset > 0) {
			this._scroll(cw.pageXOffset - cw.innerWidth);
		}
		else {

			this.goItem(-1, onLoadPartDone);
			var me = this;
			function onLoadPartDone() {
				// then go to end of part
				let cw = me.iframe.contentWindow,
					maxw = me.iframe.contentDocument.documentElement.scrollWidth,
					page = Math.floor(maxw / cw.innerWidth);

				me._scroll(Math.floor(page * cw.innerWidth));
			}
			this._scroll(cw.pageXOffset + cw.innerWidth);
		}
	}


	nextPage() {
		if (!this.allowMove) return;

		let cw = this.iframe.contentWindow,
			maxw = this.iframe.contentDocument.documentElement.scrollWidth;
		// some calc result 0.xyz, so round number to 1 pixel
		let n = Math.floor(cw.pageXOffset + cw.innerWidth) + 1;
		if (n < maxw) {
			// contentFrame.contentDocument.documentElement.scrollWidth
			this._scroll(n);
		}
		else {
			// load next page

			//this.epub.nextPage(() => { $('.loader').toggleClass('open') });
			this.goItem(1, () => { });
		}
	}
}