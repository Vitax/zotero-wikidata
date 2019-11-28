/**
 * @author Caglar Özel
 */

Zotero.WikiData = new function () {
	this.openItemsPane = function () {
		window.openDialog(
			'chrome://zotero-wikidata/content/panes/itemsPane.xul',
			'',
			'chrome, titlebar, toolbar, centerscreen' + Zotero.Prefs.get('browser.preferences.instantApply', true) ? 'dialog=no' : 'modal'
		);
	};

	/**
	 * Function copied from Firefox documentation to open a url in the default browser
	 * @param url
	 * @returns {*}
	 */
	this.openInBrowser = function (url) {
		if (!url.match(/^https?/)) {
			throw new Error("launchURL() requires an HTTP(S) URL");
		}

		let ioservice = Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService);

		let uriToOpen = ioservice.newURI(url, null, null);
		let extps = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
			.getService(Components.interfaces.nsIExternalProtocolService);

		// now, open it!
		return extps.loadURI(uriToOpen, null);
	};

	/**
	 * Modified Zotero.openInViewer function to fit my needs
	 * @param url {string} url to the page
	 * @param onload {function} onload callback to have a queue when the page is fully loaded
	 */
	this.openInViewer = function (url, onload) {
		var wm = Services.wm;
		var win = wm.getMostRecentWindow("zotero-wikidata:viewer");
		if (win) {
			win.loadURI(url);
		} else {
			let ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1']
				.getService(Components.interfaces.nsIWindowWatcher);
			let arg = Components.classes["@mozilla.org/supports-string;1"]
				.createInstance(Components.interfaces.nsISupportsString);
			arg.data = url;
			win = ww.openWindow(null, "chrome://zotero-wikidata/content/viewer/customViewer.xul",
				"viewer", "chrome,dialog=yes,resizable,centerscreen,menubar,scrollbars", arg);
		}
		if (onload) {
			let browser
			let func = function () {
				browser = win.document.documentElement.getElementsByTagName('browser')[0];
				browser.addEventListener("pageshow", innerFunc);
			};
			let innerFunc = function () {
				onload(browser.contentDocument);
			};
			win.addEventListener("load", func);
		}
	}
};

