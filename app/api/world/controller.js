const services = require('./services')
const responseError = require('~/app/responseError')

module.exports = {
   /**
    * Signup controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   createNewWorld: async ({ body: { name, cover, password, tags }, token }, res) => {
      if (!name) return res.status(400).send(responseError('missing-info', 'Missing information.'))
      try {
         const newWorld = await services.newWorld(token._id, name, cover, password, tags ? tags.split(' ') : tags)
         res.status(201).send(newWorld)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   },

   /**
    * Fetch my worlds controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   getMyWorlds: async ({ token }, res) => {
      try {
         const myWorlds = await services.fetchWorldsByOwner(token._id)
         res.status(201).send(myWorlds)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.'))
      }
   },

   /**
    * Deletes a world controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   deleteWorld: async ({ token, body: { _id } }, res) => {
      try {
         const foundWorld = await services.fetchWorld(_id)
         if (!foundWorld) return res.status(404).send(responseError('world-not-found', 'World was not found.'))
         if (token._id !== foundWorld.owner) return res.status(403).send(responseError('not-owner', 'You are not the owner of the world.'))
         await services.destroyWorld(_id)
         res.sendStatus(200)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.'))
      }
   },

   /**
    * Updates a world controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   updateWorld: async ({ token, body: { _id, name, members, cover, password, tags } }, res) => {
      if (!_id || (!name && !cover && !password && !tags)) return res.status(400).send(responseError('missing-info', 'Missing information.'))
      try {
         const foundWorld = await services.fetchWorld(_id)
         if (!foundWorld) return res.status(404).send(responseError('world-not-found', 'World was not found.'))
         if (token._id !== foundWorld.owner) return res.status(403).send(responseError('not-owner', 'You are not the owner of the world.'))

         const toBeUpdated = {}
         if (typeof name !== 'undefined') toBeUpdated.name = name
         if (typeof cover !== 'undefined') toBeUpdated.cover = cover
         if (typeof password !== 'undefined') toBeUpdated.password = password
         if (typeof members !== 'undefined') toBeUpdated.members = members
         if (typeof tags !== 'undefined') toBeUpdated.tags = tags.split(' ')

         console.log(toBeUpdated)

         const modifiedWorld = await services.modifyWorld(_id, toBeUpdated)
         res.status(200).send(modifiedWorld)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.'))
      }
   }
}
