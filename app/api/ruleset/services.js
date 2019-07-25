const Ruleset = require('./model')

module.exports = {
   /**
    * Creates a new Ruleset
    * @param {object} args - Ruleset's args
    * @returns {object}
    */
   newRuleset: args => {
      const newRuleset = new Ruleset(args)
      return newRuleset.save()
   },
   
}
