/**
 * @author Caglar Özel
 * @type function
 */
Zotero.WikiData.ItemsPane = {
	_LIMIT: 10,
	_WAITAFTERINPUT: 250, //in ms
	_WAITAFTERATTEMPT: 500, //in ms

	_missingAnything: false,
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
		this._registerClickEventHandler();
	},

	/**
	 * Refreshes the list of locate engines in the locate pane
	 * @param {String} name of locate engine to select
	 */
	_registerClickEventHandler: function () {
		let tree = document.getElementById('zotero-wikidata-items-tree');
		// add click listener
		tree.addEventListener("click", (event) => this._treeClick(event), false);
	},

	_treeClick: function (event) {
		let t = event.originalTarget;

		// Check if you are in the treechildren container
		if (t.localName != 'treechildren') {
			return;
		}

		let tree = t.parentNode;

		let row = {}, col = {}, obj = {};
		tree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, obj);

		let treeitem = this._items[row.value];

		// Check for left and right click
		if (event && event.button == 2 && event.detail == 1) {
			let optionsMenu = document.getElementById('options-menu');

			optionsMenu.addEventListener("onpopupshowing", () => {
				let createManual = document.getElementById('create-item-manual');
				let createAutomated = document.getElementById('create-item-automated');

				createManual.addEventListener('command', Zotero.WikiData.Entry.openItemInformationWindow(treeitem));
				createAutomated.addEventListener('command', Zotero.WikiData.Entry.createNewEntry("", "", "", {}));
			})
		}
		if (event && event.button == 0 && event.detail == 2) {
			this.openUpLink(treeitem);
		}
	},

	/**
	 *
	 * @returns {Promise<void>}
	 * @private
	 */
	_loadItems: async function () {
		let tree = document.getElementById('zotero-wikidata-items-tree');
		let self = this;
		const itemIDs = await Zotero.DB.columnQueryAsync(`
            SELECT DISTINCT items.itemID
            FROM items
                     LEFT JOIN itemTypeFields
                               ON items.itemTypeID = itemTypeFields.itemTypeID
                     LEFT JOIN itemTypes
                               ON items.itemTypeID = itemTypes.itemTypeID
            WHERE itemTypes.typeName <> 'attachment'
              AND itemTypes.typeName <> 'note'
		`);

		let items = await Zotero.Items.getAsync(itemIDs);
		let promises = [];

		items = items.filter(item => !item.deleted);

		for (let item of items) {
			item.wikiDataEntry = "None";
			item.wikiDataLink = "";
			let queryString = "";

			if (item.getField("DOI")) {
				queryString = `SELECT ?item WHERE { ?item ?doi  "${item.getField("DOI").toUpperCase()}". }`;

				promises.push(this.queryDispatcher.queryEntry(queryString)
					.then(result => {
						const data = JSON.parse(result.responseText);

						if (data.results.bindings.length > 0) {
							item.wikiDataLink = data.results.bindings[1].item.value;
							let linkParts = item.wikiDataLink.split('/');
							item.wikiDataEntry = linkParts[linkParts.length - 1];
						}
					}));
			}
		}

		await Zotero.Promise.all(promises)
			.then(() => {
				this._items = items;

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

	_handleRightClick: function (item, clientX, clientY) {
		Zotero.debug(JSON.stringify(item));
	},

	/**
	 * Opens up a browser with injected javascript to automatically fill in fields for WikiData
	 * Should receive a index which will help loading the right items from the tree list
	 *
	 * @param index { number }
	 */
	openUpLink: function (item) {
		if (item.wikiDataLink) {
			Zotero.WikiData.openInBrowser(item.wikiDataLink);
		}
	},

	_openItemInformationWindow: function (item) {
		window.openDialog(
			'chrome://zotero-wikidata/content/itemPrefab/itemPrefab.xul',
			'',
			'chrome, titlebar, toolbar, centerscreen',
			item
		);
	},

	_checkupLoop: async function (doc, item) {
		// sleep for 500ms after each attempt to wait for possible loads and other update events on the dom
		await this._sleep(this._WAITAFTERATTEMPT);

		if (this._ATTEMPTS !== this._LIMIT) {
			this._checkCurrentState(doc);

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
				await this._populateItem(doc, item);
			}
			this._ATTEMPTS++;
		} else {
			this._restartAttempts();
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

		if (currentUrl.includes("https://www.wikidata.org/wiki/Q")) {
			this._currentLoopState.popuplateItem = true;
		}
	},

	/**
	 * Remove all added events from the doc
	 * @param doc
	 * @private
	 */
	_done: function (doc) {
		doc.removeEventListener('load', () => {
		});

		doc.removeEventListener('pageshow', () => {
		});
	},

	_getDescriptionString(item) {
		if (item.itemType === 'journalArticle') {
			return Zotero.getString('zotero.wikidata.items.type.article') + item.date;
		}

		if (item.itemType === 'book') {
			return Zotero.getString('zotero.wikidata.items.type.book') + item.date;
		}

		return "Item release on " + item.date;
	},

	/**
	 *
	 * @param item
	 * @returns {*}
	 * @private
	 */
	_getAliasesString(item) {
		let aliases = "";
		let numOfTags = 5;
		for (let i = 0; i < 5; i++) {
			if (i < numOfTags - 1) {
				aliases = aliases.concat(item.getTags()[i].tag, ", ");
			} else {
				aliases = aliases.concat(item.getTags()[i].tag, "");
			}
		}

		return aliases;
	},

	/**
	 *
	 * @param string
	 * @param element {HTMLElement}
	 * @returns {Promise<void>}
	 * @private
	 */
	_writeText: function (element, string) {
		if (!element) {
			return;
		}

		element.value = string;   // this alone was not working as keypress.
		let evt = document.createEvent("HTMLEvents");
		evt.initEvent("change", false, true); // adding this created a magic and passes it as if keypressed
		element.dispatchEvent(evt);
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

	_authenticate: async function (doc, item) {
		// Get these dynamically later on
		let username = "OtherWorldyTestAccount";
		let password = "AwesomePassword123";

		let usernameField = doc.getElementById('wpName1');
		let passwordField = doc.getElementById('wpPassword1');
		const loginButtonElement = doc.getElementById('wpLoginAttempt')

		if (usernameField && usernameField.value.length === 0) {
			usernameField.value = username;
		}

		if (passwordField && passwordField.value.length === 0) {
			passwordField.value = password;
		}

		await this._sleep(this._WAITAFTERINPUT)

		if (loginButtonElement &&
			(usernameField && usernameField.value.length !== 0) &&
			(passwordField && passwordField.value.length !== 0)) {
			loginButtonElement.click();
		} else {
			this._checkupLoop(doc, item);
		}
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
		titleField.value = item.getField('title');
		descriptionField.value = this._getDescriptionString(item);
		aliasesField.value = this._getAliasesString(item);

		setTimeout(() => {
			if (createItemButton &&
				(titleField && titleField.value.length !== 0) &&
				(descriptionField && descriptionField.value.length !== 0) &&
				(aliasesField && aliasesField.value.length !== 0)) {
				createItemButton.click();
			} else {
				this._checkupLoop(doc, item);
			}
		}, this._WAITAFTERINPUT);
	},

	/**
	 *
	 * @param doc {HTMLDocument}
	 * @returns {HTMLElement}
	 * @private
	 */
	_triggerAddStatementEvent: function (doc) {
		let bodyContent = doc.getElementById('bodyContent');
		const addStatementField = Zotero.Utilities.xpath(bodyContent,
			'//div[@class="wikibase-statementgrouplistview"]' +
			'/div[@class="wikibase-addtoolbar wikibase-toolbar-item wikibase-toolbar ' +
			'wikibase-addtoolbar-container wikibase-toolbar-container"]' +
			'/span' +
			'/a'
		);

		addStatementField[0].click();
	},

	/**
	 *
	 * @param doc {HTMLDocument} Current DOM of the browser
	 * @returns {*}
	 * @private
	 */
	_getStatementListElement: function (doc) {
		const bodyContent = doc.getElementById('bodyContent');
		return Zotero.Utilities.xpath(bodyContent, '//div[@class="wikibase-statementgrouplistview"]')[0];
	},

	_addInstanceOfProperty: async function (doc) {
		let statementListEl = this._getStatementListElement(doc);
		let propertyInputField = Zotero.Utilities.xpath(statementListEl,
			'//div[@class="wikibase-snakview-property-container"]' +
			'/div[@class="wikibase-snakview-property"]' +
			'/input')[0];

		// focus input field to be sure
		propertyInputField.focus();

		// sleep for 250 ms to wait for the dom to update
		await this._sleep(this._WAITAFTERINPUT);

		propertyInputField.focus();
		// write text instance of into the property field
		this._writeText(propertyInputField, "instance of");

		// sleep for 250 ms to wait for the dom to update
		await this._sleep(this._WAITAFTERINPUT);

		let instanceOfItem = Zotero.Utilities.xpath(statementListEl, '//a[@href="//www.wikidata.org/wiki/Property:P31"]')[0].parentElement;
		/**
		 * reahed limit of automating here !
		 * cannot dispatch keyboard or mouse events since see: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Auto-repeat_handling_prior_to_Gecko_5.0
		 */
		instanceOfItem.click();

		// sleep for 250 ms to wait for the dom to update
		await this._sleep(this._WAITAFTERINPUT);

		// re-set the statementListEl to have a fresh representation of the dom
		statementListEl = this._getStatementListElement(doc);
		const propertyValue = Zotero.Utilities.xpath(statementListEl,
			'//div[@class="wikibase-snakview-body"]' +
			'/div[@class="wikibase-snakview-value wikibase-snakview-variation-valuesnak"]' +
			'/div' +
			'/div' +
			'/textarea')[0];

		await this._sleep(this._WAITAFTERINPUT);
		this._writeText(propertyValue, "scholarly article");

		// 	this._triggerKeyEvents(propertyField, this._RETURNKEYCODE); // press return
	},

	_populateItem: async function (doc, item) {
		this._triggerAddStatementEvent(doc);
		await this._sleep(this._WAITAFTERINPUTT);
		await this._addInstanceOfProperty(doc);
	}
};
