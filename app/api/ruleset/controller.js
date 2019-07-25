const services = require('./services')
const Ruleset = require('./model')
const responseError = require('~/app/responseError')

module.exports = {
   /**
    * Signup controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   createNewRuleset: async ({ body: { name }, token }, res) => {
      if (!name) return res.status(400).send(responseError('missing-info', 'Missing information.'))
      try {
         const newRuleset = await services.newRuleset({ owner: token._id, name })
         res.status(201).send(newRuleset)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   },

   /**
    * Signup controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   getRuleset: async ({ params: { _id }}, res) => {
      if (!_id) return res.status(400).send(responseError('missing-info', 'Missing information.'))
      try {
         const fetchedRuleset = await Ruleset.findById(_id)
         res.status(201).send(fetchedRuleset)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   },

   /**
    * Signup controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   getMyRulesets: async ({ token }, res) => {
      try {
         const fetchedRulesets = await Ruleset.find({ owner: token._id })
         res.status(201).send(fetchedRulesets)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   },

   /**
    * Signup controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   updateRuleset: async ({ params: { _id }, body, token }, res) => {
      try {
         const foundRuleset = await Ruleset.findById(_id)
         if (!foundRuleset) return res.status(404).send(responseError('ruleset-not-found', 'Ruleset was not found.'))
         if (token._id !== foundRuleset.owner.toString()) return res.status(403).send(responseError('not-owner', 'You are not the owner of the ruleset.'))

         const update = Object.assign({}, body)
         delete update._id
         delete update._v
         const newRuleset = await Ruleset.findByIdAndUpdate(_id, update)
         res.status(201).send(newRuleset)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   },

}
