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
// function parseDOM(str, mimetype) {
// 	var parser = new DOMParser();
// 	return parser.parseFromString(str, mimetype);
// }


class Epub {
	//http://idpf.org/epub/linking/cfi/
	// firebase call html page directly so we must change html to something else (se)
	static se = '.se';

	constructor() {
		//	this.epubView = epubView;
		this._clear() // reset to zero
	}

	_clear() {
		this.path = null;
		this.position = -1;
		this.toc = null; // json of toc.ncx
		this.contentOpf = null; // format in json
		this.opfDOM = null; // format in DOM for cfi
	}

	/**
	 * close books
	 */
	close() {
		this._clear();
	}

	/**
	 * is on view book
	 */
	isOpen() {
		return (this.path != null);
	}

	setPath(path) {
		this.path = path;
	}


	/**
	 * get html anchor
	 * @param {string} part 
	 * return undefined if not found
	 */
	static getAnchor(part) {
		if (part.lastIndexOf('#') == -1)
			return undefined;

		let x = part.substring(part.lastIndexOf('#') + 1);
		if (x.lastIndexOf('.se') == -1)
			return x;
		return x.substring(0, x.lastIndexOf('.se'))
	}


	/**
	 * a.html -> a.html.se
	 * a.html#anchor ->a.html.se#anchor
	 * @param {string} url 
	 */
	static addPlusExt(url) {
		if (!url) return url;
		// if no anchor
		if (url.lastIndexOf('#') == -1)
			return url + Epub.se;
		// else, get anchor and 
		let noanchor = url.substring(0, url.lastIndexOf('#'));
		let anchor = url.substring(url.lastIndexOf('#'), url.length);
		return noanchor + Epub.se + anchor;
	}

	/**
	 * We add end of .html files with own '.se' extension, so remove when
	 * a.html.se -> a.html
	 * a.html.se#anchor -> a.html#anchor
	 * @see static se
	 * @param {*} url 
	 */
	static removePlusExt(url) {
		if (!url) return url;
		if (!url.match(/.*\.se/)) return url;
		// no anchor
		if (url.lastIndexOf('#') == -1) {
			// if end of url is .se
			if (url.match(/.*\.se$/)) {
				return url.substring(0, url.length - 3);
			}
			return url;
		}
		else {
			let noanchor = url.substring(0, url.lastIndexOf('#'));
			let anchor = url.substring(url.lastIndexOf('#'), url.length);
			if (noanchor.match(/.*\.se$/)) {
				return noanchor.substring(0, noanchor.length - 3) + anchor;
			}
			return noanchor + anchor;
		}
	}


	/**
	 * Open a book
	 * @param {callback function} cbLoaddone call when load done
	 * @param page = page to view
	 */
	initBook(page) {
		return Promise.all([
			this._read_content_opf(),
			this._read_toc_ncx()
		]);
	}

	async _read_toc_ncx() {
		const p = this.path + "/toc.ncx";
		return fetch(p)
			.then(r => r.text())
			.then(t => {
				try {
					let x2js = new X2JS();
					this.toc = x2js.xml_str2json(t);
					console.log("toc.ncx");
				}
				catch (e) {
					throw e;
				}  				// view first page
			});
	}


	/**
	 * Open a book
	 * @param {callback function} cbLoaddone call when load done
	 * @param page = page to view
	 * async function hello() { return "Hello" };
	hello().then((value) => console.log(value))
	 */
	async _read_content_opf(page = undefined) {
		const p = this.path + "/content.opf";
		return fetch(p)
			.then(r => r.text())
			.then(t => {
				try {
					let x2js = new X2JS();
					this.contentOpf = x2js.xml_str2json(t);
				}
				catch (e) {
					throw e;
				}
			});
	}


	/**
	 * page = index_split_002.html
	 * <item id="id254" href="index_split_002.html" media-type="application/xhtml+xml"/>
	 * @param {string} page in format part-1.html
	 * return index to Toc 
	 */
	hrefToIndex(page) {
		if (page) {
			let i = 0,
				nav = this.contentOpf.package.manifest.item;
			for (const t of nav) {
				if (t['_href'] === page)
					return i;
				i++;
			}
			return 0;
		}
		else
			return 0; // first page
	}

	/**
	 * <item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>
	 * @param {page name} page 
	 */
	readPart_(page, onLoadPartDone) {
		// page = Epub.removePlusExt(page);
		// // saved book or new book
		// if (!page) {
		// 	let saved = EpubView.getLastView(this.path);
		// 	if (saved) page = saved['part']['_href'];
		// }
		// let position = this._hrefToIndex(page);
		// this._readPart(position, onLoadPartDone);
	}


	/**
	 * read a html part, from content.opf
	 * TODO: add  sign when event begin-end load load page.
	  <item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>
	 * 
	 * @param {*} position 
	 * @param {*} onLoadPartDone 
	 */
	// _readPart(position, onLoadPartDone = undefined) {
	// 	if (!Number.isInteger(position))
	// 		throw 'Parameter is not a number!';
	// 	let pointsToc = this.contentOpf.package.manifest.item;
	// 	if (position < 0) {
	// 		position = 0;
	// 	}
	// 	else if (position >= pointsToc.length) {
	// 		position = pointsToc.length - 1;
	// 	}
	// 	this.position = position;
	// 	let point = pointsToc[position];
	// }

	/**
	 * get contentOpf.package.manifest.item;
	 * @returns 
	 */
	gotoItem(position) {
		if (!Number.isInteger(position))
			throw 'Parameter is not a number!';
		let pointsToc = this.contentOpf.package.manifest.item;
		if (position < 0) {
			position = 0;
		}
		else if (position >= pointsToc.length) {
			position = pointsToc.length - 1;
		}
		this.position = position;
		return pointsToc[position];
	}

}

