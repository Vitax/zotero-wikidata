/**
 * @author Caglar Özel
 */

Zotero.WikiData = new function () {
	this.openItemsPane = function () {
		window.openDialog(
			'chrome://zotero-wikidata/content/panes/itemsPane.xul',
			'chrome, titlebar, toolbar, centerscreen' + Zotero.Prefs.get('browser.preferences.instantApply', true) ? 'dialog=no' : 'modal'
		);
	};

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

	this.openInViewer = function (url, onload) {
		var wm = Services.wm;
		var win = wm.getMostRecentWindow("zotero:basicViewer");
		if (win) {
			win.loadURI(uri);
		} else {
			let ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1']
				.getService(Components.interfaces.nsIWindowWatcher);
			let arg = Components.classes["@mozilla.org/supports-string;1"]
				.createInstance(Components.interfaces.nsISupportsString);
			arg.data = uri;
			win = ww.openWindow(null, "chrome://zotero/content/standalone/basicViewer.xul",
				"basicViewer", "chrome,dialog=yes,resizable,centerscreen,menubar,scrollbars", arg);
		}
		if (onLoad) {
			let browser
			let func = function () {
				win.removeEventListener("load", func);
				browser = win.document.documentElement.getElementsByTagName('browser')[0];
				browser.addEventListener("pageshow", innerFunc);
			};
			let innerFunc = function () {
				browser.removeEventListener("pageshow", innerFunc);
				onLoad(browser.contentDocument);
			};
			win.addEventListener("load", func);
		}
	}
};

