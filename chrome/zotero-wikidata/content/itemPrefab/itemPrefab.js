/**
 * @author Caglar Özel
 * @type function
 */

Zotero.WikiData.ItemPrefab = {

	init: function () {
		let _item = null;

		if ('arguments' in window && window.arguments.length > 0) {
			this._prepareData(window.arguments[0]);
		}
	},

	_prepareData: function (item) {
		this._setTitle(item);
		this._setDescription(item);
		this._setAliases(item);
		this._setDOI(item);
		this._setPMID(item);
	},

	_setTitle: function (item) {
		let titleField = document.getElementById('item-title');
		titleField.value = item.getField('title');
	},

	_setDescription(item) {
		let descriptionText = "Item released on " + new Date(item.date).toDateString();
		if (item.itemType === 'journalArticle') {
			descriptionText = Zotero.getString('zotero.wikidata.items.type.article') + new Date(item.date).toDateString();
		}

		if (item.itemType === 'book') {
			descriptionText = Zotero.getString('zotero.wikidata.items.type.book') + new Date(item.date).toDateString();
		}

		let descriptionField = document.getElementById('item-description');
		descriptionField.value = descriptionText;
	},

	_setAliases(item) {
		let aliases = "";
		let numOfTags = 5;
		for (let i = 0; i < 5; i++) {
			if (i < numOfTags - 1) {
				aliases = aliases.concat(item.getTags()[i].tag, ", ");
			} else {
				aliases = aliases.concat(item.getTags()[i].tag, "");
			}
		}

		let aliasesField = document.getElementById('item-aliases');
		aliasesField.value = aliases;
	},

	_setDOI: function (item) {
		let doiField = document.getElementById('item-doi');
		doiField.value = item.getField("DOI");
	},

	_setPMID: function(item) {
		let doiField = document.getElementById('item-pmid');
		doiField.value = item.getField("PMID");
	}
};
