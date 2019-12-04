/**
 * @author Caglar Özel
 * @type function
 */

Zotero.WikiData.ItemPrefab = {

	init: function () {
		this._ZoteroWikiDataIntl = new Zotero.WikiData.Intl();

		if ('arguments' in window && window.arguments.length > 0) {
			this._prepareData(window.arguments[0]);
			Zotero.debug(JSON.stringify(window.arguments[0]))
		}
	},

	_prepareData: function (item) {
		this._setWindowTitle(item);

		this._setTitle(item);
		this._setDescription(item);
		this._setAliases(item);
		this._setInstanceOf();
		this._setDOI(item);
		this._setISSN(item);
		this._setISBN(item);
		this._setPMID(item);

		this._setAuthors(item);

		this._setDate(item);
		this._setPages(item);
		this._setVolume(item);
		this._setIssue(item);
		this._setLanguage(item);

	},

	_setWindowTitle(item) {
		document.title = item.title;
	},

	_setTitle: function (item) {
		let titleField = document.getElementById('item-title');
		titleField.value = item.title;
	},

	_setDescription(item) {
		let descriptionText = "Item released on " + " " + item.date;

		if (item.itemTypeID === Zotero.ItemTypes.getID('journalArticle')) {
			descriptionText = this._ZoteroWikiDataIntl.getString('zotero.wikidata.items.type.article') + " " + item.date;
		}

		if (item.itemTypeID === Zotero.ItemTypes.getID('book')) {
			descriptionText = this._ZoteroWikiDataIntl.getStrig('zotero.wikidata.items.type.book') + " " + item.date;
		}

		let descriptionField = document.getElementById('item-description');
		descriptionField.value = descriptionText;
	},

	_setAliases(item) {
		if (!item.tags.length) {
			return;
		}

		let aliases = "";
		let numOfTags = 5;

		for (let i = 0; i < 5; i++) {
			if (i < numOfTags - 1) {
				aliases = aliases.concat(item.tags[i].tag, ", ");
			} else {
				aliases = aliases.concat(item.tags[i].tag, "");
			}
		}

		let aliasesField = document.getElementById('item-aliases');
		aliasesField.value = aliases;
	},

	_setInstanceOf() {
		let instanceOfField = document.getElementById("item-instance-of");
		instanceOfField.value = "scholarly article";
	},

	_setDOI: function (item) {
		let doiField = document.getElementById('item-doi');

		if (item.DOI) {
			doiField.value = item.DOI.toUpperCase();
		}
	},

	_setPMID: function (item) {
		let doiField = document.getElementById('item-pmid');
		if (item.PMID) {
			doiField.value = item.PMID;
		}
	},

	_setISSN: function (item) {
		let issnField = document.getElementById('item-issn');
		if (item.ISSN) {
			issnField.value = item.ISSN
		}
	},

	_setISBN: function (item) {
		let isbnField = document.getElementById('item-issn');
		if (item.ISBN) {
			isbnField.value = item.ISSN
		}
	},

	_setURL: function(item) {
		let urlField = document.getElementById('item-url');
		urlField = item.URL;
	},

	_setAuthors: function (item) {
		const namespace = 'http://www.w3.org/1999/xhtml';
		let creators = item.creators;
		let authorsContainer = document.getElementById('authors-container');

		for (let creator of creators) {
			let div = document.createElement("hbox");

			let label = document.createElement("label");
			label.setAttribute("value", this._ZoteroWikiDataIntl.getString("zotero.wikidata.items.type.author"));

			let textBox = document.createElement("textbox");
			textBox.setAttribute("flex", "1");
			textBox.setAttribute("value", creator.firstName + " " + creator.lastName);

			div.appendChild(label);
			div.appendChild(textBox);

			authorsContainer.appendChild(div);
		}
	},

	_setPages: function (item) {
		let dateField = document.getElementById('item-date');
		dateField.value = item.date;
	},

	_setPages: function (item) {
		let pagesField = document.getElementById('item-pages');
		pagesField.value = item.pages;
	},

	_setVolume: function (item) {
		let volumeField = document.getElementById('item-volume');
		volumeField.value = item.volume;
	},

	_setIssue: function (item) {
		let issueField = document.getElementById('item-issue');
		issueField.value = item.issue;
	},

	_setDate: function (item) {
		let dateField = document.getElementById('item-date');
		dateField.value = item.date;
	},

	_setLanguage: function (item) {
		let languageField = document.getElementById('item-language');
		languageField.value = item.language;
	}

};
