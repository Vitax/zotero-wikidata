/**
 * @author Caglar Özel
 * @param endpoint
 * @constructor
 */

Zotero.WikiData.SPARQLQueryDispatcher = function (endpoint) {
	this.enpoint = endpoint;
};

/**
 * This function will dispatch a http get request to lookup for an item in
 * WikiData
 * @param doi of the zotero item
 * @returns {Promise<Object | false>}
 */

Zotero.WikiData.SPARQLQueryDispatcher.prototype.queryEntry = async function (doi) {
	const queryString = `
		select distinct ?item
		where
		{
			?item ?doi ${doi}
		}
	`
	const fullURL = this.enpoint + '?query=' + querySting;
	const headers = {'Accept': 'application/sparql-results+json'};

	return Zotero.HTTP.request('GET', fullURL, {headers: headers})
};
