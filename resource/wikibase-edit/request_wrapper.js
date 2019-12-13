const error_ = require('./error')
const fetchUsedPropertiesDatatypes = require('./fetch_used_properties_datatypes')
const resolveTitle = require('./resolve_title')
const validateAndEnrichConfig = require('./validate_and_enrich_config')
const validateParameters = require('./validate_parameters')

module.exports = (fnModulePath, generalConfig) => {
  const fn = require(`./${fnModulePath}`)
  return (params, reqConfig) => {
    const config = validateAndEnrichConfig(generalConfig, reqConfig)
    validateParameters(params)

    const { post } = require('./request')(config)
    return fetchUsedPropertiesDatatypes(params, config)
    .then(() => {
      if (!config.properties) throw error_.new('properties not found', config)
      const { action, data } = fn(params, config.properties, config.instance)

      if (!data.title) return post(action, data, config)

      return resolveTitle(data.title, config.instance)
      .then(title => {
        data.title = title
        return post(action, data, config)
      })
    })
  }
}
