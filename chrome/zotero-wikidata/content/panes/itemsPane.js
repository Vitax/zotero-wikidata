/**
 * @author Caglar Özel
 * @type function
 */

Zotero.WikiData.ItemsPane = {
	_items: null,

	init: async function () {
		this.queryDispatcher = new Zotero.WikiData.SPARQLQueryDispatcher("https://query.wikidata.org/sparql");
		await this._loadItems();
	},

	// /**
	//  *
	//  * @returns {Promise<void>}
	//  * @private
	//  */
	_loadItems: async function () {
		const htmlNS = 'http://www.w3.org/1999/xhtml';
		const itemIDs = await Zotero.DB.columnQueryAsync(`
				SELECT DISTINCT items.itemID 
				FROM items
				LEFT JOIN itemTypeFields 
					ON items.itemTypeID = itemTypeFields.itemTypeID	
				LEFT JOIN itemTypes 
					ON items.itemTypeID = itemTypes.itemTypeID
				WHERE 
					itemTypes.typeName <> 'attachment'
			`);

		let items = await Zotero.Items.getAsync(itemIDs);
		items = items.filter(item => !item.deleted);
		items.map(item => {
			item.wikiDataEntry = "None";
			let queryString = "";

			if (item.getField("DOI")) {
				queryString = 'SELECT ?item WHERE { ?item ?doi "' + item.getField("DOI") + '". }';
			} else if (!item.getField("DOI") && item.getField("PMID")) {
				queryString = 'SELECT ?item WHERE { ?item ?pmid "' + item.getField("PMID") + '". }';
			} else {
				return;
			}

			this.queryDispatcher.queryEntry(queryString)
				.then(result => {
					Zotero.debug('wiki data entries: ' + JSON.parse(result.responseText));
				})
		});

		this._items = items;

		let tree = document.getElementById('zotero-wikidata-items-tree');

		let treeView = {
			rowCount: items.length,
			getCellText: function (row, column) {
				if (column.id === "zotero-wikidata-column-title") {
					return items[row].getField('title')
				}

				if (column.id === "zotero-wikidata-column-url") {
					return items[row].wikiDataEntry;
				}
				// if (column.id === "zotero-wikidata-button") {
				// 	let wikiDataButton = document.createElementNS(htmlNS,'button');
				// 	wikiDataButton.setAttribute('label', 'general.create');
				// 	wikiDataButton.addEventListener('oncommand', this.openUpTestBrowser(item));
				// 	return wikiDataButton;
				// }
			},
			setTree: function (treebox) {
				this.treebox = treebox;
			},
			isContainer: function (row) {
				return false;
			},
			isSeparator: function (row) {
				return false;
			},
			isSorted: function () {
				return false;
			},
			getLevel: function (row) {
				return 0;
			},
			getImageSrc: function (row, col) {
				return null;
			},
			getRowProperties: function (row, props) {
			},
			getCellProperties: function (row, col, props) {
			},
			getColumnProperties: function (colid, col, props) {
			}
		};

		tree.view = treeView;
	},

	/**
	 * Opens up a browser with injected javascript to automatically fill in fields for WikiData
	 * Should receive a Zotero.Item from the tree list
	 *
	 * @param item { Zotero.Item }
	 */
	openUpLinkOrCreate: function (index) {
		Zotero.debug('this is: ' + this._items[index].getField('title'));
		const url = "https://www.wikidata.org/wiki/Special:NewItem";

		window.openDialog(url)
	}
};
