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
	 * Should receive a index which will help loading the right items from the tree list
	 *
	 * @param index { number }
	 */
	openUpLinkOrCreate: function (index) {
		const url = "https://www.wikidata.org/w/index.php?title=Special:UserLogin&returnto=Wikidata%3AMain+Page";

		let chosenItem = this._items[index];
		// let instance = Zotero.WikiData.openInBrowser(url)
		Zotero.WikiData.openInViewer(url, (doc) => this.authenticate(doc, chosenItem));
	},

	authenticate: function (doc, chosenItem) {
		let username = "OtherWorldyTestAccount";
		let password = "AwesomePassword123";

		doc.getElementById('wpName1').value = username;
		doc.getElementById('wpPassword1').value = password;
		doc.getElementById('wpLoginAttempt').click((e) => {
			doc.addEventListener("onload", (e) => {
				Zotero.debug('inside here: ' + doc);
				this.redirectToNewItem(doc, chosenItem);
			})
		});

	},

	redirectToNewItem(doc, item) {
		doc.getElementById('n-special-newitem').childNodes[0].click((e) => {
			doc.addEventListener('onload', () => {
				this.autocompleteFields(doc, item);
			})
		});
	},

	autocompleteFields: function (doc, item) {
		doc.getElementById('ooui-php-3').value = item.getField('title');
	},
};
