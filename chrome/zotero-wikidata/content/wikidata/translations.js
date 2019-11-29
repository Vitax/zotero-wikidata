let _stringBundle = null;

Zotero.WikiData.Intl = function () {
    const src = 'chrome://zotero-wikidata/locale/zotero-wikidata.properties';
    const stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"]
        .getService(Components.interfaces.nsIStringBundleService);

    _stringBundle = stringBundleService.createBundle(src);
};

/**
 *
 * @param property
 * @returns {string}
 */
Zotero.WikiData.Intl.prototype.getString = function (property) {
    return _stringBundle.GetStringFromName(property);
};


