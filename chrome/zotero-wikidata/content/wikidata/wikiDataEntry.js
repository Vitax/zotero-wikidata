Zotero.WikiData.Entry = {
	/**
	 *
	 * @param item
	 */
	openItemInformationWindow: function (item) {
		window.openDialog(
			'chrome://zotero-wikidata/content/itemPrefab/itemPrefab.xul',
			'',
			'chrome, titlebar, toolbar, centerscreen',
			item
		);
		Zotero.WikiData.openInBrowser("https://www.wikidata.org/wiki/Special:NewItem");
	},

	/**
	 *
	 * @param label {string} label of the wikidata entry
	 * @param description {string} description of the wikidata entry
	 * @param aliases {string} aliases for the entry which are the first 5 tags of the current item if existing
	 * @param claims {Object} containg all required information such as authors, doi, instance of and further more
	 * @returns {Promise<Object>} Entity which got created at wikidata
	 */
	createNewEntry: async function (label, description, aliases, claims) {
		Zotero.debug('inside here');
		return;

		/**
		 * TODO: Pick username and password from a config file, make sure password is hashed in a decent manner and can
		 *       be resolved back to its password
		 * @type {{summary: string, instance: string, credentials: {password: string, username: string}}}
		 */
		const generalConfig = {
			// wikibase instance
			instance: 'https://www.wikidata.org',

			// One authorization mean is required
			credentials: {
				// pass username password to the instance
				username: 'my-wikidata-username',
				password: 'my-wikidata-password',
			},

			// Optional
			summary: 'zotero-wikibase'
		};

		const wikibaseEdit = require("wikibase-edit")(generalConfig)

		return await wikibaseEdit.create({
			type: "item",
			labels: label,
			descriptions: description,
			aliases: aliases,
			claims: claims
		});
	},

	analyze: async function (url) {
		let xmlDocument = await this._retrieveXMLDocumentFromURL()
		this._analyzeForMissingEntries(xmlDocument);
	},

	_retrieveXMLDocumentFromURL: async function (url) {
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
	},

	_analyzeForMissingEntries: function (xmlDocument) {
		this._expressionOfConcernNotice(xmlDocument);
		this._retractionNotice(xmlDocument);
	},

	_expressionOfConcernNotice: function (xmlDocument) {

	},

	_retractionNotice: function (xmlDocument) {
		let instanceOfList = Zotero.Utilities.xpatch(xmlDocument, '//div[@id=" + this._wikiDataClassifiers.instance_of + "]');

	},

	_wikiDataClassifiers: {
		"instance_of": "P31",
		"title": "P1476",
		"author": "P50",
		"language_of_work": "P407",
		"publication_date": "P577",
		"published_in": "P1433",
		"volume": "P478",
		"pages": "P304",
		"issue": "P433",
		"is_retracted_by": "P5824",
		"pubmed_id": "P698",
		"doi": "P356",
		"open_citation": "P3181"
	}
};
