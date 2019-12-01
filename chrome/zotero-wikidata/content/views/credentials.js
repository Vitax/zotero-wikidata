Components.utils.import("resource://gre/modules/osfile.jsm");

Zotero.WikiData.Credentials = {
    init: async function () {
        this._credentialsFile = OS.Path.join(OS.Constants.Path.profileDir, "credentials.json");

        let credentials = await this._loadCredentials();

        if (credentials.wikidata && credentials.wikidata.username) {
            let usernameField = document.getElementById('zotero-wikidata-username');
            usernameField.value = credentials.wikidata.username;
        }

        if (credentials.wikidata && credentials.wikidata.password) {
            let passwordField = document.getElementById('zotero-wikidata-password');
            passwordField.value = credentials.wikidata.password;
        }
    },

    _loadCredentials: async function () {
        if (!await OS.File.exists(this._credentialsFile)) {
            return false;
        }

        let content = await Zotero.File.getContentsAsync(this._credentialsFile);
        if (content.length > 0) {
            return JSON.parse(content);
        } else {
            return false;
        }
    },

    setUsername: function (event) {
        this._username = event.target.value;
    },

    setPassword: function (event) {
        this._password = event.target.value;
    },

    saveCredentials: async function () {
        let credentials = await this._loadCredentials();

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
    },

    _writeToFile: async function (data) {
        try {
            await Zotero.File.putContentsAsync(this._credentialsFile, JSON.stringify(data));
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

        let credentials = await this._loadCredentials();
        if (!credentials) {
            return;
        }

        credentials.wikidata = {};

        await this._writeToFile(credentials);
    }
};