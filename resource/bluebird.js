"use strict";
var old;

if (typeof Promise !== "undefined") old = Promise;

function noConflict() {
	try {
		if (Promise === bluebird) Promise = old;
	} catch (e) {
		Zotero.debug('error while fetching bluebird: ' + e);
	}
	return bluebird;
}

var bluebird = require("resource://zotero-wikidata/bluebird/promise")();
bluebird.noConflict = noConflict;

module.exports = bluebird;
