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

		// this.path = null;
		// this.position = -1;
		// this.pointsToc = [];
		// this.bookExt = '' // @see 'se' extension
		this.close()
	}

	/**
	 * close books
	 */
	close(){
		this.path = null;
		this.position = -1;
		this.pointsToc = [];
		this.bookExt = '' // @see 'se' extension
	}

	/**
	 * is on view book
	 */
	isOpen(){
		return (this.path != null)
	}

	/**
	 * get html anchor
	 * @param {string} part 
	 * return undefined if not found
	 */
	getAnchor(part){
		if(part.lastIndexOf('#') == -1)
			return undefined;

		let x = part.substring (part.lastIndexOf('#')+1);
		if (x.lastIndexOf('.se') == -1)
			return x;
		return x.substring (0, x.lastIndexOf('.se'))
	}

	setPath(path){
		this.path = path;
	}

	nextPage(onLoadPartDone=undefined){
		let i = this.position+1;
		this.readPart(i, onLoadPartDone);
	}

	prevPage(onLoadPartDone=undefined){
		let i = this.position-1;
		this.readPart(i, onLoadPartDone);
	}

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

	/**
	 * read a html part, 
	 * TODO: add  sign when event begin-end load load page.
	 * @param {*} position 
	 * @param {*} onLoadPartDone 
	 */
	readPart(position, onLoadPartDone=undefined){
		if(!Number.isInteger(position))
			throw 'Parameter is not a number!';
		if (position < 0){
			position = 0;
		}
		else if(position >= this.pointsToc.length){
			position = this.pointsToc.length - 1;
		}
		this.position = position;
		let point = this.pointsToc[position];

		let url = this.path +"/" + point.content;
		
		url = this.removePlusExt(url);
		this.viewer.src = url;

		// setup viewer, after load done, update View
		// 
		// this.setViewerStyle();
		$(this.viewer).addClass('open'); // show viewer iframe

		// callback when load done
		if (onLoadPartDone){
			$(this.viewer).on('load', e=>{
				onLoadPartDone();
				$(this.viewer).unbind('load');
			});
		}
	}


	/**
	 * page-name from url to index in toc
	 * @param {string} page in format part-1.html
	 * return index to Toc 
	 */
	_pageToIndex(page){
		if (page){
			let i = 0;
			for(const t of this.pointsToc){
				if(t.content === page)
					return i;
				i++;
			}
			return 0;
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
				this.readPart(i);    				// view first page
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