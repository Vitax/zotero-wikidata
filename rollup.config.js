// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import jsonResolver from 'rollup-plugin-json';

export default {
  input: './chrome/zotero-wikidata/lib/wikiDataService',
  output: {
    file: './chrome/zotero-wikidata/lib/wikiDataServiceBundle.js',
    format: 'iife'
  },
  plugins: [
    resolve(),
      jsonResolver(),
    commonJS({
      include: 'node_modules/**'
    })
  ]
};
