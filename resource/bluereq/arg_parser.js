const getOptions = require('./get_options')
const haveData = [ 'POST', 'PUT', 'MATCH' ]

module.exports = function (method, args) {
  method = method.toUpperCase()
  const hasData = haveData.includes(method)
  const options = getOptions(args, hasData)
  options.method = method
  return options
}
