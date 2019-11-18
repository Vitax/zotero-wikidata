/**
 * @author Caglar Özel
 * @type function
 */

Zotero.WikiData.ItemsPane = {
	init: Zotero.Promise.coroutine(function* () {
		this.queryDispatcher = new Zotero.WikiData.SPARQLQueryDispatcher("https://query.wikidata.org/sparql");
		yield this._loadItems();
	}),

	// /**
	//  *
	//  * @returns {Promise<void>}
	//  * @private
	//  */
	_loadItems: async function () {
		const htmlNS = 'http://www.w3.org/1999/xhtml';
		const itemIDs = await Zotero.DB.columnQueryAsync('SELECT itemID from items');

		let childrenContainer = document.getElementById('zotero-wikidata-items-children');

		// Create a treerow for each item and append it to the treechildren container
		for (let itemID of itemIDs) {
			let item = Zotero.Items.get(itemID);

			if (item.deleted) {
				return;
			}

			Zotero.debug('item title: ' + item.getField('title'));

			let treeitem = document.createElementNS(htmlNS, 'treeitem');
			let treerow = document.createElementNS(htmlNS, 'treerow');

			let titleCell = document.createElementNS(htmlNS, 'treecell');
			let wikiDataURLCell = document.createElementNS(htmlNS, 'treecell');
			let wikiDataButtonCell = document.createElementNS(htmlNS, 'treecell');

			let title = document.createElement("p");

			// 		let wikiDataLink = document.createElement("a");
			//
			title.innerHTML = item.getField('title');
			titleCell.appendChild(title);
			//
			// 		let wikiDataEntry = await this.queryDispatcher.queryEntry(item.getField('doi'));
			// 		wikiDataLink.href = "http://thisisatesturl.com";
			// 		wikiDataLink.textContent = "TestLink";
			// 		wikiDataURLCell.appendChild(wikiDataLink);
			//
			// 		Zotero.debug(wikiDataEntry);
			//

			let wikiDataButton = document.createElement('button');
			wikiDataButton.innerHTML = "&zotero-wikidata.items.create";
			// 		wikiDataButton.addEventListener('onclick', this.openUpTestBrowser(item));
			wikiDataButtonCell.appendChild(wikiDataButton);

			treerow.appendChild(titleCell)
			treerow.appendChild(wikiDataURLCell)
			treerow.appendChild(wikiDataButtonCell);

			treeitem.appendChild(treerow);

			childrenContainer.appendChild(treeitem);
		}
		// Zotero.Utilities.Internal.updateHTMLInXUL()
	},

	/**
	 * Opens up a browser with injected javascript to automatically fill in fields for WikiData
	 * Should receive a Zotero.Item from the tree list
	 *
	 * @param item { Zotero.Item }
	 */
	openUpTestBrowser: function (item) {
		const url = "https://www.wikidata.org/wiki/Special:NewItem";

		window.open(url,)
	}
};
