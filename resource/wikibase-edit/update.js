const validate = require('./validate')
const getEntityClaims = require('./get_entity_claims')
const _ = require('./utils')
const error_ = require('./error')
const findSnak = require('./find_snak')
const validateAndEnrichConfig = require('./validate_and_enrich_config')

module.exports = (API, generalConfig) => (params, reqConfig) => {
  const { guid, property, oldValue, newValue } = params

  const config = validateAndEnrichConfig(generalConfig, reqConfig)

  validate.guid(guid)
  validate.property(property)
  const datatype = config.properties[property]
  validate.snakValue(property, datatype, oldValue)
  validate.snakValue(property, datatype, newValue)

  if (oldValue === newValue) {
    throw error_.new('same value', 400, oldValue, newValue)
  }

  // Get current value snak hash
  return getSnakHash(guid, property, datatype, oldValue, config)
  // Pass the reqConfig to avoid getting into errors of the kind
  // 'credentials should either be passed at initialization or per request'
  // as API.qualifier.set is already bound to the generalConfig
  .then(hash => API.qualifier.set({ guid, hash, property, value: newValue }, reqConfig))
}

const getSnakHash = (guid, property, datatype, oldValue, config) => {
  const entityId = guid.split('$')[0]
  return getEntityClaims(entityId, config)
  .then(claims => {
    const claim = findClaim(claims, guid)

    if (!claim) throw error_.new('claim not found', 400, guid)
    if (!claim.qualifiers) throw error_.new('claim qualifiers not found', 400, guid)

    const propSnaks = claim.qualifiers[property]

    const qualifier = findSnak(property, datatype, propSnaks, oldValue)

    if (!qualifier) {
      throw error_.new('qualifier not found', 400, guid, property, oldValue)
    }
    return qualifier.hash
  })
}

const findClaim = (claims, guid) => {
  claims = _.flatten(_.values(claims))
  for (let claim of claims) {
    if (claim.id === guid) return claim
  }
}
