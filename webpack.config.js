const path = require("path")

module.exports = {
    node: {
        fs: "empty"
    },
    entry: {
        wikiDataService: './chrome/zotero-wikidata/content/wikidata/wikiDataServices.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './chrome/zotero-wikidata/content/bundles')
    }
};
