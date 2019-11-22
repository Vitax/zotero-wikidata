/**
 * @author Caglar Özel
 * @type function
 */

Zotero.WikiData.ItemsPane = {
	_LIMIT: 10,
	_WAITAFTERATTEMPT: 500, //in ms
	_WAITFORBUTTONCLICK: 250, //in ms

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

		let tree = document.getElementById('zotero-wikidata-items-tree');

		tree.view = {
			rowCount: 1,
			getCellText: function (row, column) {
				if (column.id === "zotero-wikidata-column-title") {
					return "loading ..."
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

		let items = await Zotero.Items.getAsync(itemIDs);
		let promises = [];

		items = items.filter(item => !item.deleted);
		items.map(item => {
			item.wikiDataEntry = "None";
			item.wikiDataLink = "";
			let queryString = "";

			if (item.getField("DOI")) {
				queryString = 'SELECT ?item WHERE { ?item ?doi "' + item.getField("DOI") + '". }';
			} else if (!item.getField("DOI") && item.getField("PMID")) {
				queryString = 'SELECT ?item WHERE { ?item ?pmid "' + item.getField("PMID") + '". }';
			} else {
				return;
			}

			promises.push(this.queryDispatcher.queryEntry(queryString)
				.then(result => {
					const data = JSON.parse(result.responseText);

					if(data.results.bindings.length > 0) {
						item.wikiDataLink = data.results.bindings[1].item.value;
						let linkParts = item.wikiDataLink.split('/');
						item.wikiDataEntry = linkParts[linkParts.length - 1];
					}
				}));
		});

		this._items = items;

		await Zotero.Promise.all(promises)
			.then(() => {
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
			});
	},

	/**
	 * Opens up a browser with injected javascript to automatically fill in fields for WikiData
	 * Should receive a index which will help loading the right items from the tree list
	 *
	 * @param index { number }
	 */
	openUpLinkOrCreate: function (index) {
		let wikiDataItemLink = "";
		let item = this._items[index];
		const wikiDataLoginUrl = "https://www.wikidata.org/w/index.php?title=Special:UserLogin&returnto=Wikidata%3AMain+Page";

		this._ATTEMPTS = 0;
		if(item.wikiDataLink) {
			Zotero.WikiData.openInViewer(item.wikiDataLink, null);
		} else {
			Zotero.WikiData.openInViewer(wikiDataLoginUrl, (doc) => this._checkupLoop(doc, item));
		}
	},

	_checkupLoop: function (doc, item) {
		if (this._ATTEMPTS !== this._LIMIT) {
			this._checkCurrentState(doc);

			setTimeout(() => {
				if (this._currentLoopState.login) {
					this._authenticate(doc, item);
				}

				if (this._currentLoopState.mainPage) {
					this._redirectToNewItem(doc, item)
				}

				if (this._currentLoopState.createItem) {
					this._createItem(doc, item);
				}

				if (this._currentLoopState.popuplateItem) {
					this._populateItem(doc, item);
				}
			}, this._WAITAFTERATTEMPT);

			this._ATTEMPTS++;
		} else {
			// this._restartAttempts();
		}
	},

	_checkCurrentState: function (doc) {
		const currentUrl = doc.location.href;

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

	_restartAttempts: function (doc, item) {
		// if (restart event from confirmationDialog) {
		// set: this._ATTEMPTS = 0;
		// call: this._checkupLoop(doc, item);
		// }
		// else {
		// call: this._done(doc)
		// }
	},

	_authenticate: function (doc, item) {
		// Get these dynamically later on
		let username = "OtherWorldyTestAccount";
		let password = "AwesomePassword123";

		let usernameField = doc.getElementById('wpName1');
		let passwordField = doc.getElementById('wpPassword1');
		let loginButtonElement = doc.getElementById('wpLoginAttempt')

		if (usernameField && usernameField.value.length === 0) {
			usernameField = username;
		}

		if (passwordField && passwordField.value.length === 0) {
			passwordField.value = password;
		}

		setTimeout(() => {
			if (loginButtonElement && passwordField.value.length !== 0) {
				loginButtonElement.click();
			} else {
				this._checkupLoop(doc, item);
			}
		}, this._WAITFORBUTTONCLICK);
	},

	_redirectToNewItem: function (doc, item) {
		let redirectToCreateItemElement = doc.getElementById('n-special-newitem').childNodes[0];

		if (redirectToCreateItemElement) {
			redirectToCreateItemElement.click();
		} else {
			this._checkupLoop(doc, item);
		}

	},

	_createItem: function (doc, item) {
		let aliases = "";
		let titleField = doc.getElementById('ooui-php-3');
		let descriptionField = doc.getElementById('ooui-php-4');
		let aliasesField = doc.getElementById('ooui-php-5');
		let createItemButton = doc.getElementById('wb-newentity-submit').childNodes[0];

		// prepare aliases using the tags from zotero
		item.getTags().forEach((tag, index) => {
			if(index !== item.getTags().length) {
				aliases = aliases.concat(tag.tag, ', ');
			} else {
				aliases = aliases.concat(tag.tag, '');
			}
		});

		titleField.value = item.getField('title');
		descriptionField =
		aliasesField.value = aliases;

		setTimeout(() => {
			if (createItemButton &&
				(titleField && titleField.value.length !== 0) &&
				(aliasesField && aliasesField.value.length !== 0)) {
				createItemButton.click();
			} else {
				this._checkupLoop(doc, item);
			}
		}, this._WAITFORBUTTONCLICK);
	},

	_populateItem: function (doc, item) {
		this._checkupLoop(doc, item);
	}
};
