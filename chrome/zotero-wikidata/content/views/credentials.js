Components.utils.import("resource://gre/modules/osfile.jsm");

Zotero.WikiData.Credentials = {
    init: async function () {
        let credentials = await this.loadCredentials();

        if (!credentials) {
            return;
        }

        if (credentials.wikidata && credentials.wikidata.username) {
            let usernameField = document.getElementById('zotero-wikidata-username');
            usernameField.value = credentials.wikidata.username;
        }

        if (credentials.wikidata && credentials.wikidata.password) {
            let passwordField = document.getElementById('zotero-wikidata-password');
            passwordField.value = credentials.wikidata.password;
        }
    },

    loadCredentials: async function () {
        Components.utils.import("resource://gre/modules/osfile.jsm");
        let _credentialsFile = OS.Path.join(OS.Constants.Path.profileDir, "credentials.json");

        if (!await OS.File.exists(_credentialsFile)) {
            return false;
        }

        let content = await Zotero.File.getContentsAsync(_credentialsFile);
        if (content.length > 0) {
            return JSON.parse(content);
        } else {
            return false;
        }
    },

    /**
     * Handle change event of the username textbox
     * @param event { Event<HTMLElement>}
     */
    setUsername: function (event) {
        this._username = event.target.value;
    },

    /**
     * Handle change event of the password textbox
     * @param event { Event<HTMLElement>}
     */
    setPassword: function (event) {
        this._password = event.target.value;
    },

    /**
     * Toggle visibility of password
     */
    toggleVisiblePassword: function () {
        let showPasswordButton = document.getElementById('zotero-wikidata-password');

        if (showPasswordButton.getAttribute('type') === 'password') {
            showPasswordButton.setAttribute('type', 'text');
        } else {
            showPasswordButton.setAttribute('type', 'password');
        }
    }
    ,

    saveCredentials: async function () {
        let credentials = await this.loadCredentials();

        if (!credentials) {
            credentials = {
                wikidata: {
                    username: this._username,
                    password: this._password
                }
            };
            return await this._writeToFile(credentials);
        } else if (credentials && credentials.wikidata && credentials.wikidata.username && credentials.wikidata.password) {
            if (credentials.wikidata.username !== document.getElementById('zotero-wikidata-username').value) {
                credentials.wikidata.username = this._username;
            }

            if (credentials.wikidata.password !== document.getElementById('zotero-wikidata-password').value) {
                credentials.wikidata.password = this._password;
            }
            return await this._writeToFile(credentials);
        } else {
            credentials = {
                wikidata: {
                    username: this._username,
                    password: this._password
                }
            };
            return await this._writeToFile(credentials);
        }
    }
    ,

    _writeToFile: async function (data) {
        Components.utils.import("resource://gre/modules/osfile.jsm");
        try {
            await Zotero.File.putContentsAsync(_credentialsFile, JSON.stringify(data));
        } catch (e) {
            Zotero.debug("Error writing to file : " + e);
        }
    }
    ,

    deleteCredentials: async function () {
        let usernameField = document.getElementById('zotero-wikidata-username');
        usernameField.value = "";
        let passwordField = document.getElementById('zotero-wikidata-password');
        passwordField.value = "";

        let credentials = await this.loadCredentials();
        if (!credentials) {
            return;
        }

        credentials.wikidata = {};

        await this._writeToFile(credentials);
    }
}
;