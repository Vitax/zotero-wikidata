/**
 * @author Caglar Özel
 */

Zotero.WikiData = new function() {
    this.openItemsPane = function() {
        window.openDialog(
            'chrome://zotero-wikidata/content/panes/itemsPane.xul',
            'chrome, titlebar, toolbar, centerscreen' + Zotero.Prefs.get('browser.preferences.instantApply', true) ? 'dialog=no' : 'modal'
        );
    };
};

