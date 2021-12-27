	// call after open a book
function initIframeView(ev){
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
			overflow: scroll !important;
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
	font.href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital@0;1&display=swap";
	font.rel="stylesheet"
	ev.target.contentDocument.head.appendChild(font)
	
	//ev.target.contentDocument = html loaded in iframe 
	$(ev.target.contentDocument.body).addClass('greyBook');
	resizeEpubView();

}
	

function resizeEpubView() {
	// iframe innerHeight
	// for setting iframe heigth 
	let h = epubReader.viewer.contentWindow.innerHeight - 40 +'px'; //ng1
	// let h = epubReader.viewer.contentWindow.innerHeight+100+'px'; //ng1
	if (epubReader.viewer.contentDocument.documentElement) 
		epubReader.viewer.contentDocument.documentElement.style.height = h;
}
var currZoom = 100;
function zoomBook(step){
	if (false){//$.browser.mozilla){
		//var step = 0.02;
		currFFZoom += step; 
		$('body').css('MozTransform','scale(' + currFFZoom + ')');
	} else {
		currZoom += step;
		$(epubReader.viewer.contentDocument.body).css('zoom', ' '+currZoom+'%');
	}

}