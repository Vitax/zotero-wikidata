Zotero.WikiData.ItemMenu = {

	buildMenu: function (item) {
		let itemMenu = document.getElementById('zotero-wikidate-item-menu');

		/** delete all entries of previous item menu */
		while (itemMenu.childElementCount > 0) {
			itemMenu.removeChild(itemMenu.firstChild());
		}

	},
};
