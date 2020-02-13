// import wikibase from 'wikibase-edit'

/**
 *
 * @constructor
 */
Zotero.WikiData.Service = new function () {

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
            return {
                // wikibase instance
                instance: 'https://www.wikidata.org',

                // One authorization mean is required
                credentials: {
                    // pass username password to the instance
                    username: credentials.wikidata.username,
                    password: credentials.wikidata.password
                }
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
        let config = await this._prepareConfig(data.credentials);

        if (!config) {
            return;
        }


        try {
            let claims = data.claims;
            let labels = data.labels;
            let descriptions = data.descriptions;
            let aliases = data.aliases;
            let sitelinks = {};

            let wbEdit = wikibase(config);

            await wbEdit.entity.create({
                type: 'item',
                labels,
                descriptions,
                aliases,
                claims,
                sitelinks
            })
                .then(entity => {
                    Zotero.debug('entity: ' + JSON.string(entity));
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
};
