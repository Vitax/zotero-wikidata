const _ = require('./utils')
const error_ = require('./error')
const validate = require('./validate')
const { entityEditBuilders: builders } = require('./builders')
const buildSnak = require('./snak')
const { hasSpecialSnaktype } = require('./special_snaktype')
const datatypesToBuilderDatatypes = require('./datatypes_to_builder_datatypes')

module.exports = (property, properties, value, instance) => {
  const datatype = properties[property]

  const builderDatatype = datatypesToBuilderDatatypes(datatype)
  const builder = builders[builderDatatype]

  const params = { properties, datatype, property, value, builder, instance }

  if (_.isString(value) || _.isNumber(value)) {
    return simpleClaimBuilder(params)
  } else {
    if (!_.isPlainObject(value)) throw error_.new('invalid claim value', { property, value })
    return fullClaimBuilder(params)
  }
}

const simpleClaimBuilder = params => {
  const { property, datatype, value, builder, instance } = params
  validate.snakValue(property, datatype, value)
  return builder(property, value, instance)
}

const fullClaimBuilder = params => {
  const { properties, datatype, property, value: claimData, builder, instance } = params
  var { id, value, snaktype, rank, qualifiers, references, remove } = claimData

  if (remove === true) {
    if (!id) throw error_.new("can't remove a claim without an id", claimData)
    return { id, remove: true }
  }

  var claim
  if (hasSpecialSnaktype(claimData)) {
    claim = builders.specialSnaktype(property, snaktype)
  } else {
    // In case of a rich value (monolingual text, quantity, or globe coordinate)
    if (value == null && (claimData.text || claimData.amount || claimData.latitude)) {
      value = claimData
    }
    validate.snakValue(property, datatype, value)
    claim = builder(property, value, instance)
  }

  if (id) {
    validate.guid(id)
    claim.id = id
  }

  if (rank) {
    validate.rank(rank)
    claim.rank = rank
  }

  if (qualifiers) {
    claim.qualifiers = _.map(qualifiers, buildPropSnaks(properties, instance))
  }

  if (references) {
    // References snaks can be slippited into records, that is
    // sub-groups of references snaks pointing to a same claim
    claim.references = _.forceArray(references).map(buildReference(properties, instance))
  }

  return claim
}

const buildReference = (properties, instance) => reference => {
  const hash = reference.hash
  const referenceSnaks = reference.snaks || reference
  const snaksPerProperty = _.map(referenceSnaks, buildPropSnaks(properties, instance))
  const snaks = _.flatten(_.values(snaksPerProperty))
  return { snaks, hash }
}

const buildPropSnaks = (properties, instance) => (prop, propSnakValues) => {
  validate.property(prop)
  return _.forceArray(propSnakValues).map(snakValue => {
    const datatype = properties[prop]
    validate.snakValue(prop, datatype, snakValue)
    return buildSnak(prop, datatype, snakValue, instance)
  })
}
