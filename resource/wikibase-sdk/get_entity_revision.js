const validate = require('./validate')
const { isPlainObject } = require('./utils')

module.exports = instance => (id, revision) => {
  if (isPlainObject(id)) {
    revision = id.revision
    id = id.id
  }
  validate.entityId(id)
  validate.revisionId(revision)
  return `${instance}/w/index.php?title=Special:EntityData/${id}.json&oldid=${revision}`
}
