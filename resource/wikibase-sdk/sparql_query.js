const { fixedEncodeURIComponent } = require('./utils')

module.exports = sparqlEndpoint => sparql => {
  const query = fixedEncodeURIComponent(sparql)
  return `${sparqlEndpoint}?format=json&query=${query}`
}
