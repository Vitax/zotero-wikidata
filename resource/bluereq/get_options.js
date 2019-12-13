const signature = require('./signature_checker')

module.exports = function (args, hasData = false) {
  let options

  // get(url) or delete(url) or post(url) or put(url) or head(url)
  if (signature.matches(args, 'string')) {
    options = { url: args[0] }
    options.json = hasData ? {} : true

  // get(options) or delete(options) or post(options) or put(options) or head(options)
  } else if (signature.matches(args, 'object')) {
    options = args[0]
    if (options.json == null) options.json = true

  // post(url, json) or put(url, json)
  } else if (signature.matches(args, 'string', 'object') && hasData) {
    options = { url: args[0], json: args[1] }

  // post(url, text) or put(url, text)
  } else if (signature.matches(args, 'string', 'string') && hasData) {
    options = { url: args[0], body: args[1] }
  } else {
    throw new Error(`Invalid params: ${args.join(', ')}`)
  }

  // Default to gzip on
  options.gzip = options.gzip !== false

  return options
}
