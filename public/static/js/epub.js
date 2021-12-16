/**
 * Flow default read order:
 * meta-inf/container.xml (not required)
 *  ->content.opf
 *  ->toc.ncx
 * ->
 *  +-----
 *  +
 *  +-----
 */


/**
 * Update Iframe when
 *  1) load html file done
 *  2) windonw (chrome) resize
 */

// <navPoint id="num_1" playOrder="1" class="chapter">
//  <navLabel>
//     <text>LỜI GIỚI THIỆU</text>
//  </navLabel>
//  <content src="index_split_000.html#p2"/>
// </navPoint>
class Epub {
	// firebase call html page directly so we must change html to something else (se)
	static se = '.se';

	constructor(viewer){
		this.viewer = viewer;

		this.path = null;
		this.position = -1;
		this.pointsToc = [];
		this.bookExt = '' // @see 'se' extension
		
		
		// this.viewer.addEventListener("resize", ev => {
		// 	let h = epubReader.viewer.contentWindow.innerHeight-100 +'px';
		// 	// epubReader.viewer.contentDocument.documentElement.style.height  = '200px';
		// 	epubReader.viewer.contentDocument.documentElement.style.height = h;
		// });

	}

	setPath(path){
		this.path = path;
	}

	nextPage(){
		let i = this.position;
		this.readContent(++i);
	}

	prevPage(){
		let i = this.position;
		this.readContent(--i);
	}
	// next(){
	// 	// if(1){
	// 	// 	let p = this.position + 1;
	// 	// 	this.readContent(p);
	// 	// }
	// 	let contentWindow = epubReader.viewer.contentWindow;
	// 	contentWindow.scroll(contentWindow.pageXOffset + (contentWindow.innerWidth + 5) * 1, 0);

	// }
	// back(){
	// 	// if (this.position > 0 ){
	// 	// 	let p = this.position - 1;
	// 	// 	this.readContent(p);
	// 	// }
	// 	let contentWindow = epubReader.viewer.contentWindow;
	// 	contentWindow.scroll(contentWindow.pageXOffset - (contentWindow.innerWidth - 5) * 1, 0);

	// }
	/**
	 * We add end of .html files with own '.se' extension, so remove when
	 * @see static se
	 * @param {*} url 
	 */
	removePlusExt(url){
		if(url.match(/.*\.se$/)){
			return url.substring(0, url.length - 3);
		}
		return url;
	}

	readContent(index){
		if (index < 0){
			index = 0;
		}
		else if(index >= this.pointsToc.length){
			index = this.pointsToc.length - 1;
		}
		this.position = index;
		let point = this.pointsToc[index];

		let url = this.path +"/" + point.content;
		
		url = this.removePlusExt(url);
		this.viewer.src = url;

		// setup viewer, after load done, update View
		// 
		// this.setViewerStyle();
		$(this.viewer).addClass('open'); // show viewer iframe
	}


	/**
	 * page-name from url to index in toc
	 * @param {string} page in format part-1.html
	 * return index to Toc 
	 */
	_pageToIndex(page){
		if (page){
			for(let i in this.pointsToc){
				if (this.pointsToc[i].content === page){
					return i;
				}
			}
		}
		else
			return 0; // first page
	}
	/**
	 * Open a book
	 * @param {callback function} cbLoaddone call when load done
	 * @param page = page to view
	 */
	view(cbLoaddone, page=undefined) {
		const p = this.path+"/toc.ncx";
		fetch(p)
			.then(r => r.text())
			.then(t => {
				this.read_tocncx(t, cbLoaddone);    // view mucluc
				let i = this._pageToIndex(page)
				this.readContent(i);    // view first page
			});
	}

	
	
   

	read_tocncx(content, cbLoaddone) {
		try {
			var parser = new DOMParser();

			content = content.replace(/xml version="1\.1"/, 'xml version="1.0"');
			content = content.replace(/&(?!amp;)([a-z]+;)/gi, "&amp;$1");
			content = content.replace(/&(?![a-z]+;)/gi, "&amp;");

			var nav = parser.parseFromString(content, "text/xml");
			var navMap = nav.getElementsByTagNameNS("*", "navMap")[0];
			var navPoints = navMap.getElementsByTagNameNS("*", "navPoint");
		}
		catch (e) {
			throw e;
		}

		this.pointsToc = [];

		if (navPoints && navPoints.length > 0) {
			var pointCounter = 0;

			for (var i = 0; i < navPoints.length; i++) {
				try {
					var label = navPoints[i].getElementsByTagNameNS("*", "navLabel")[0]
						.getElementsByTagNameNS("*", "text")[0].textContent;

					var content = navPoints[i].getElementsByTagNameNS("*", "content")[0].getAttribute("src");
					var navPoint = navPoints[i];
					var point = [];

					for (var j = 1; j < 10; j++) {
						var parent = navPoint.parentNode;

						if (!parent.nodeName.match("navPoint")) {
							point['level'] = j;
							break;
						}
						else {
							navPoint = parent;
						}
					}

					point['label'] = label;
					point['content'] = content + Epub.se; // remove .html extension to 

					this.pointsToc[pointCounter] = point;
					pointCounter++;
				}
				catch (e) {
				}
			}
		}
		// callback when load book done (for UI refresh)
		cbLoaddone();
	}
}

function read_content_opf() {
	//let parser = new DOMParser();
	//let xmlDoc = parser.parseFromString(text,"text/xml");
	// console.log(111);
	// const url = "/f2/toc.ncx";
	// fetch(url)
	//     .then(r => r.text())
	//     .then(t => console.log(t))
	const url = "/f2/toc.ncx";
	fetch(url)
		.then(r => {
			return r.text()
		})
		.then(t => console.log(t))
}


/*
<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
	apiKey: "AIzaSyA7xgfdWa0XDlTh1E9GoROcLClCZIfAQuI",
	authDomain: "singlepage-717c0.firebaseapp.com",
	projectId: "singlepage-717c0",
	storageBucket: "singlepage-717c0.appspot.com",
	messagingSenderId: "426864728301",
	appId: "1:426864728301:web:1282f117094e98b392d4e4"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script>
*/