const request = require('resource://zotero-wikidata/request')
const BluePromise = require('resource://zotero-wikidata/bluebird')
const pick = require('resource://zotero-wikidata/lodash-pick')
// attributes to keep from a response object with statusCode >= 400
const errorAttributes = [
  'statusCode',
  'statusMessage',
  'headers',
  'body',
  'elapsedTime'
]

module.exports = function (options) {
  return new BluePromise(function (resolve, reject) {
    request(options, function (err, res) {
      if (err != null) {
        reject(err)
      } else if (res.statusCode < 400) {
        resolve(res)
      } else {
        handleHttpErrorCode(res, reject)
      }
    })
  })
}

const handleHttpErrorCode = function (res, reject) {
  const err = new Error(res.statusMessage)
  // copy all the data from res to err
  const data = pick(res, errorAttributes)
  data.url = res.request.uri.href
  Object.assign(err, data)
  reject(err)
}
