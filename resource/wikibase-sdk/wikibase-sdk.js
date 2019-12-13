const { isPlainObject } = require('./utils')

const simplify = require('./simplify')
const parse = require('./parse_responses')
const helpers = require('./helpers')
const sitelinksHelpers = require('./sitelinks')
const rankHelpers = require('./helpers/rank')
const tip = `Tip: if you just want to access functions that don't need an instance or a sparqlEndpoint,
those are also exposed directly on the module object. Exemple:
const { isItemId, simplify } = require('wikibase-sdk')`

const common = Object.assign({ simplify, parse }, helpers, sitelinksHelpers, rankHelpers)

const WBK = function (config) {
  if (!isPlainObject(config)) throw new Error('invalid config')
  const { instance, sparqlEndpoint } = config

  if (!(instance || sparqlEndpoint)) {
    throw new Error(`one of instance or sparqlEndpoint should be set at initialization.\n${tip}`)
  }

  var wikibaseApiFunctions, instanceRoot, instanceApiEndpoint
  if (instance) {
    validateEndpoint('instance', instance)

    instanceRoot = instance
      .replace(/\/$/, '')
      .replace('/w/api.php', '')

    instanceApiEndpoint = `${instanceRoot}/w/api.php`

    const buildUrl = require('./build_url')(instanceApiEndpoint)

    wikibaseApiFunctions = {
      searchEntities: require('./search_entities')(buildUrl),
      getEntities: require('./get_entities')(buildUrl),
      getManyEntities: require('./get_many_entities')(buildUrl),
      getRevisions: require('./get_revisions')(buildUrl),
      getEntityRevision: require('./get_entity_revision')(instance),
      getEntitiesFromSitelinks: require('./get_entities_from_sitelinks')(buildUrl)
    }
  } else {
    wikibaseApiFunctions = {
      searchEntities: missingInstance('searchEntities'),
      getEntities: missingInstance('getEntities'),
      getManyEntities: missingInstance('getManyEntities'),
      getRevisions: missingInstance('getRevisions'),
      getEntityRevision: missingInstance('getEntityRevision'),
      getEntitiesFromSitelinks: missingInstance('getEntitiesFromSitelinks')
    }
  }

  var wikibaseQueryServiceFunctions
  if (sparqlEndpoint) {
    validateEndpoint('sparqlEndpoint', sparqlEndpoint)
    wikibaseQueryServiceFunctions = {
      sparqlQuery: require('./sparql_query')(sparqlEndpoint),
      getReverseClaims: require('./get_reverse_claims')(sparqlEndpoint)
    }
  } else {
    wikibaseQueryServiceFunctions = {
      sparqlQuery: missingSparqlEndpoint('sparqlQuery'),
      getReverseClaims: missingSparqlEndpoint('getReverseClaims')
    }
  }

  const parsedData = {
    instance: {
      root: instanceRoot,
      apiEndpoint: instanceApiEndpoint
    }
  }

  return Object.assign(parsedData, common, wikibaseApiFunctions, wikibaseQueryServiceFunctions)
}

// Make heplpers that don't require an instance to be specified available
// directly on the exported function object
Object.assign(WBK, common)

const validateEndpoint = (name, url) => {
  if (!(typeof url === 'string' && url.startsWith('http'))) {
    throw new Error(`invalid ${name}: ${url}`)
  }
}

const missingConfig = missingParameter => name => () => {
  throw new Error(`${name} requires ${missingParameter} to be set at initialization`)
}

const missingSparqlEndpoint = missingConfig('a sparqlEndpoint')
const missingInstance = missingConfig('an instance')

module.exports = WBK
