# bluereq

**simple HTTP requests for promises lovers**
just wrapping [request](https://www.npmjs.com/package/request) with [bluebird](https://www.npmjs.com/package/bluebird). Forked from [qreq](https://www.npmjs.com/package/qreq)


## Summary

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [How-to](#how-to)
  - [the simple way](#the-simple-way)
  - [the more configurable way](#the-more-configurable-way)
  - [debug](#debug)
- [Alternatives](#alternatives)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation
```sh
npm install bluereq
```

## How-to

```javascript
var breq = require('bluereq')
```

### the simple way

* **GET** / **HEAD** / **DELETE**

```javascript
breq.get(url) // or breq.head(url) or breq.delete(url)
.then(function (res) { // do your magic here } )
.catch(function (err) { // handle error } )
```

* **POST** / **PUT**
```javascript
breq.post(url, data) // or breq.put(url, data)
.then(function (res) { // do your magic here } )
.catch(function (err) { // handle error } )
```
Here, data is assumed to be an object to be posted/put as JSON. If it isn't the case use the more configurable way


### the more configurable way
Take advantage of [request](https://www.npmjs.com/package/request) configurability to customize your request

* **GET** / **POST** / **PUT** / **HEAD** / **DELETE**

```javascript
breq.get(config) // or breq.post(config) or breq.put(config) or breq.head(config) or breq.delete(config)
.then(function (res) { // do your magic here } )
.catch(function (err) { // handle error } )
```
where config is an object with at least a url set

Example:
```javascript
var config = {
  url: 'https://inventaire.io/api/tests/public',
  body: { love: 'from bluereq'},
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': 'bimbamboumcookie=wunderbar'
  }
}
breq.post(config)
```

See [request documentation](https://www.npmjs.com/package/request) for more options

### debug
As it is using [request](https://www.npmjs.com/package/request) under the hood, you can get debug it [the same way](https://github.com/request/request#debugging):
```sh
export NODE_DEBUG=request ; node script.js
```

## Alternatives

I started this lib as a simple fork of qreq, not seeing that [a lot was already happening to wrap request and bluebird together](https://libraries.io/search?q=request+bluebird&platforms=NPM&sort=stars), especially [request-promise](https://github.com/request/request-promise) seems interesting, (while slightly more bloted ;) )
