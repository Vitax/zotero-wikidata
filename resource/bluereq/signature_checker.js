module.exports = {
  matches: function (args, ...signature) {
    if (args.length !== signature.length) return false

    for (let [index, sig] of signature.entries()) {
      if (typeof args[index] !== sig) return false // eslint-disable-line valid-typeof
    }

    return true
  }
}
