const wikibase = require("wikibase-edit");

Zotero.WikiData.Services = new function () {
    /**
     *
     * @param item
     */
    this.openItemInformationWindow = function (item) {
        window.openDialog(
            'chrome://zotero-wikidata/content/itemPrefab/itemPrefab.xul',
            '',
            'chrome, titlebar, toolbar, centerscreen',
            item
        );
        Zotero.WikiData.openInBrowser("https://www.wikidata.org/wiki/Special:NewItem");
    };

    /**
     *
     * @returns {Promise<boolean|{summary: string, instance: string, credentials: {password: string, username: string}}>}
     * @private
     */
    this._prepareConfig = async function (credentials) {
        if (credentials && credentials.wikidata && credentials.wikidata.username && credentials.wikidata.password) {
            return generalConfig = {
                // wikibase instance
                instance: 'https://www.wikidata.org',

                // One authorization mean is required
                credentials: {
                    // pass username password to the instance
                    username: credentials.wikidata.username,
                    password: credentials.wikidata.password
                },

                // Optional
                summary: 'zotero-wikibase'
            };
        }

        return false;
    };

    /**
     *
     * @data {Object{labels: string, descriptions: string, aliases: string[], claims: Object}}
     * @returns {Promise<Object>} Entity which got created at wikidata
     */
    this.createNewEntry = async function (data) {
        Zotero.debug("create entry");

        let wikibaseConfig = await this._prepareConfig(data.credentials);

        Zotero.debug('config: ' + JSON.stringify(wikibaseConfig));
        Zotero.debug('labels: ' + JSON.stringify(data.labels));
        Zotero.debug('descriptions: ' + JSON.stringify(data.descriptions));
        Zotero.debug('aliases: ' + JSON.stringify(data.aliases));
        Zotero.debug('claims: ' + JSON.stringify(data.claims));

        if (!wikibaseConfig) {
            return;
        }

        wikibase(wikibaseConfig);

        try {
            await wikibase.entity.create({
                type: "item",
                labels: data.labels,
                descriptions: data.descriptions,
                aliases: data.aliases,
                claims: data.claims
            });
        } catch (e) {
            Zotero.debug('Error while creating WikiData entry: ' + e);
        }
    };

    this.analyze = async function (url) {
        let xmlDocument = await this._retrieveXMLDocumentFromURL()
        this._analyzeForMissingEntries(xmlDocument);
    };

    this._retrieveXMLDocumentFromURL = async function (url) {
        return Zotero.HTTP.request("GET", url, {})
            .then((response) => {
                let htmlDoc = response.responseXML;
                let zoteroItem = Zotero.Items.get(item.itemID);

                if (!htmlDoc) {
                    var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
                        .createInstance(Components.interfaces.nsIDOMParser);
                    htmlDoc = parser.parseFromString(response.responseText, "text/html");
                }
            })
            .catch(erro => {
                Zotero.debug("Error while retrieving url: " + url);
            });
    };

    this._analyzeForMissingEntries = function (xmlDocument) {
        this._expressionOfConcernNotice(xmlDocument);
        this._retractionNotice(xmlDocument);
    };

    this._expressionOfConcernNotice = function (xmlDocument) {

    };

    this._retractionNotice = function (xmlDocument) {
        let instanceOfList = Zotero.Utilities.xpatch(xmlDocument, '//div[@id=" + this._wikiDataClassifiers.instance_of + "]');

    };

    this.WikiDataClassifiers = {
        instanceOf: "P31",
        title: "P1476",
        author: "P2093",
        languageOfWork: "P407",
        publicationDate: "P577",
        publishedIn: "P1433",
        volume: "P478",
        pages: "P304",
        issue: "P433",
        isRetractedBy: "P5824",
        pubmedID: "P698",
        doi: "P356",
        openCitation: "P3181"
    };
};
