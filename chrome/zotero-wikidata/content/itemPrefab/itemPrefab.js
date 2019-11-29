/**
 * @author Caglar Özel
 * @type function
 */

Zotero.WikiData.ItemPrefab = {

    init: function () {
        this._ZoteroWikiDataIntl = new Zotero.WikiData.Intl();
        let _item = null;

        if ('arguments' in window && window.arguments.length > 0) {
            this._prepareData(window.arguments[0]);
        }
    },

    _prepareData: function (item) {
        this._setTitle(item);
        this._setDescription(item);
        this._setAliases(item);
        this._setInstanceOf();
        this._setDOI(item);
        this._setISSN(item);
        this._setPMID(item);

        this._setAuthors(item);

        this._setPages(item);
        this._setVolume(item);
        this._setIssue(item);
        this._setLanguage(item);

    },

    _setTitle: function (item) {
        let titleField = document.getElementById('item-title');
        titleField.value = item.getField('title');
    },

    _setDescription(item) {
        let descriptionText = "Item released on " + " " + item.getField("date");

        if (item.itemTypeID === Zotero.ItemTypes.getID('journalArticle')) {
            descriptionText = this._ZoteroWikiDataIntl.getString('zotero.wikidata.items.type.article') + " " + item.getField("date");
        }

        if (item.itemTypeID === Zotero.ItemTypes.getID('book')) {
            descriptionText = this._ZoteroWikiDataIntl.getStrig('zotero.wikidata.items.type.book') + " " + item.getField("date");
        }

        let descriptionField = document.getElementById('item-description');
        descriptionField.value = descriptionText;
    },

    _setAliases(item) {
        if (!item.getTags().length) {
            return;
        }

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

    _setInstanceOf() {
        let instanceOfField = document.getElementById("item-instance-of");
        instanceOfField.value = "scholarly article";
    },

    _setDOI: function (item) {
        let doiField = document.getElementById('item-doi');
        doiField.value = item.getField("DOI").toUpperCase();
    },

    _setPMID: function (item) {
        let doiField = document.getElementById('item-pmid');
        doiField.value = item.getField("PMID");
    },

    _setISSN: function(item) {

    },

    _setAuthors: function (item) {
        const namespace = 'http://www.w3.org/1999/xhtml';
        let creators = item.getCreators();
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
       let pagesField = document.getElementById('item-pages');
       pagesField.value = item.getField('pages');
    },

    _setVolume: function(item) {
        let volumeField = document.getElementById('item-volume');
        volumeField.value = item.getField('volume');
    },

    _setIssue: function (item) {
        let issueField = document.getElementById('item-issue');
        issueField.value = item.getField('issue');
    },

    _setDate: function(item) {
        let dateField = document.getElementById('item-date');
        dateField.value = item.getField('date');
    },

    _setLanguage: function(item) {
        let languageField = document.getElementById('item-language');
        languageField.value = item.getField('language');
    }

};
