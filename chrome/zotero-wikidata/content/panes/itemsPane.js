/**
 * @author Caglar Özel
 * @type function
 */

Zotero.WikiData.ItemsPane = {
	_LIMIT: 10,
	_WAITAFTERATTEMPT: 1000, //in ms

	_items: null,
	_currentLoopState: {
		login: false,
		mainPage: false,
		createItem: false,
		popuplateItem: false
	},

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
            WHERE itemTypes.typeName <> 'attachment'
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

		tree.view = {
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
	},

	/**
	 * Opens up a browser with injected javascript to automatically fill in fields for WikiData
	 * Should receive a index which will help loading the right items from the tree list
	 *
	 * @param index { number }
	 */
	openUpLinkOrCreate: function (index) {
		this._ATTEMPTS = 0;
		const url = "https://www.wikidata.org/w/index.php?title=Special:UserLogin&returnto=Wikidata%3AMain+Page";
		let chosenItem = this._items[index];

		Zotero.WikiData.openInViewer(url, (doc) => this._checkupLoop(doc, chosenItem));
	},

	_checkupLoop: function (doc, chosenItem) {
		if (this._ATTEMPTS !== this._LIMIT) {
			Zotero.debug('inside checkup loop. Attempts: ' + this._ATTEMPTS);
			this._checkCurrentState(doc);

			setTimeout(() => {
				if (this._currentLoopState.login) {
					this._authenticate(doc, chosenItem);
				}

				if (this._currentLoopState.mainPage) {
					this._redirectToNewItem(doc, chosenItem)
				}

				if (this._currentLoopState.createItem) {
					this._createItem(doc, chosenItem);
				}
			}, this._WAITAFTERATTEMPT);

			this._ATTEMPTS++;
		} else {
			// this._restartAttempts();
		}
	},

	_checkCurrentState: function (doc) {
		const currentUrl = doc.location.href;
		Zotero.debug('checking current state: ' + JSON.stringify(this._currentLoopState));
		Zotero.debug('current url: ' + currentUrl);

		this._currentLoopState = {
			login: false,
			mainPage: false,
			createItem: false,
			popuplateItem: false
		};

		if (currentUrl === "https://www.wikidata.org/w/index.php?title=Special:UserLogin&returnto=Wikidata%3AMain+Page") {
			this._currentLoopState.login = true;
		}

		if (currentUrl === "https://www.wikidata.org/wiki/Wikidata:Main_Page") {
			this._currentLoopState.mainPage = true;
		}

		if (currentUrl === "https://www.wikidata.org/wiki/Special:NewItem") {
			this._currentLoopState.createItem = true;
		}

		if (currentUrl === "") {
			this._currentLoopState.popuplateItem = true;
		}
	},

	_done: function (doc) {
		doc.removeEventListener('load', () => {
		});

		doc.removeEventListener('pageshow', () => {
		});
	},

	_restartAttempts: function (doc, chosenItem) {
		// if (restart event from confirmationDialog) {
		// set: this._ATTEMPTS = 0;
		// call: this._checkupLoop(doc, chosenItem);
		// }
		// else {
		// call: this._done(doc)
		// }
	},

	_authenticate: function (doc, chosenItem) {
		let username = "OtherWorldyTestAccount";
		let password = "AwesomePassword123";
		let usernameField = doc.getElementById('wpName1');
		let passwordField = doc.getElementById('wpPassword1');

		if (usernameField.value.length === 0) {
			usernameField = username;
		}

		Zotero.debug("Password field value: " + passwordField.length);

		if (passwordField.value.length === 0) {
			passwordField.value = password;
		}

		if (passwordField.value.length !== 0) {
			setTimeout(() => {
				doc.getElementById('wpLoginAttempt').click();
			}, 500);
		} else {
			this._checkupLoop(doc, chosenItem);
		}
	},

	_redirectToNewItem: function (doc, chosenItem) {
		doc.getElementById('n-special-newitem').childNodes[0].click();

		this._checkupLoop(doc, chosenItem);
	},

	_createItem: function (doc, item) {
		doc.getElementById('ooui-php-3').value = item.getField('title');

		this._checkupLoop(doc, chosenItem);
	},

	_populateItem: function (doc, item) {

		this._checkupLoop(doc, chosenItem);
	}
};
