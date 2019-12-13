const path = require("path")

module.exports = {
    mode: 'production',
    entry: {
        wikiDataService: './chrome/zotero-wikidata/lib/wikiDataServices.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'chrome/zotero-wikidata/bundles')
    },
    performance: {
        hints: false,
    },
    module: {
        rules:  [
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use: "babel-loader",
            }
        ]
    },
    node: {
        fs: "empty"
    },
    resolve: {
        modules: ['node_modules']
    },
};
