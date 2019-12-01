Components.utils.import("resource://gre/modules/osfile.jsm");

Zotero.WikiData.Credentials = {
    init: async function () {
        this._credentialsFile = OS.Path.join(OS.Constants.Path.profileDir, "credentials.json");

        let credentials = await this._loadCredentials();

        Zotero.debug('username: ' + credentials.wikidata.username + " password: " + credentials.wikidata.password);
        if (credentials.wikidata && credentials.wikidata.username) {
            let usernameField = document.getElementById('zotero-wikidata-username');
            usernameField.setAttribute('value', credentials.username);
        }

        if (credentials.wikidata && credentials.wikidata.password) {
            let passwordField = document.getElementById('zotero-wikidata-password');
            passwordField.setAttribute('value', credentials.password);
        }
    },

    _loadCredentials: async function () {
        if (!await OS.File.exists(this._credentialsFile)) {
            return false;
        }

        let content = await Zotero.File.getContentsAsync(this._credentialsFile);
        if(content.length > 0) {
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

        let username = this._username;
        let password = this._password;

        if (credentials) {
            username = credentials.wikidata.username;
            password = credentials.wikidata.password;

            if (credentials.username !== this._username) {
                username = this._username;
            }

            if (credentials.password !== this._password) {
                password = this._password;
            }
        }

        await this._writeToFile({
            wikidata: {
                username: username,
                password: password
            }
        });
    },

    _writeToFile: async function (data) {
        try {
            await Zotero.File.putContentsAsync(this._credentialsFile, JSON.stringify(data));
        } catch (e) {
            Zotero.debug("Error writing to file : " + e);
        }
    },

    deleteCredentials: async function () {
        let credentials = await this._loadCredentials();

        document.getElementById('zotero-wikidata-username').setAttribute('value', "")
        document.getElementById('zotero-wikidata-password').setAttribute('value', "");

        if (!credentials) {
            return;
        }

        credentials.wikidata = {};

        await this._writeToFile(credentials);
    }
};