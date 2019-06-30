const bcrypt = require('bcrypt')
const services = require('./services')
const responseError = require('~/app/responseError')

module.exports = {
   /**
    * Signup controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   createNewWorld: async ({ body: { name, cover, password, ruleset, tags, description }, token }, res) => {
      if (!name) return res.status(400).send(responseError('missing-info', 'Missing information.'))
      try {
         const newWorld = await services.newWorld({ owner: token._id, name, description, ruleset, cover, password, tags: tags ? tags.split(' ') : tags })
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

         const modifiedMyWorlds = myWorlds.map(world => {
            const newWorld = { ...world._doc }
            newWorld.locked = !!newWorld.password && !world.members.includes(token._id)
            delete newWorld.password
            return newWorld
         })

         res.status(200).send(modifiedMyWorlds)
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
         if (token._id !== foundWorld.owner.toString()) return res.status(403).send(responseError('not-owner', 'You are not the owner of the world.'))
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
   updateWorld: async ({ token, body: { _id, ...rest } }, res) => {
      if (!_id) return res.status(400).send(responseError('missing-info', 'Missing information.'))
      try {
         const foundWorld = await services.fetchWorld(_id)
         if (!foundWorld) return res.status(404).send(responseError('world-not-found', 'World was not found.'))
         if (token._id !== foundWorld.owner) return res.status(403).send(responseError('not-owner', 'You are not the owner of the world.'))

         const toBeUpdated = { ...rest }
         delete toBeUpdated._id
         delete toBeUpdated.owner
         delete toBeUpdated.__v
         if (toBeUpdated.tags) toBeUpdated.tags = toBeUpdated.tags.split(' ')

         const modifiedWorld = await services.modifyWorld(_id, toBeUpdated)
         res.status(200).send(modifiedWorld)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   },

   /**
    * Fetch a world controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   getWorld: async ({ params: { _id } }, res) => {
      try {
         if (!_id) return res.status(400).send(responseError('missing-info', 'Missing information.'))
         const foundWorld = await services.fetchWorld(_id)
         if (!foundWorld) return res.status(404).send(responseError('world-not-found', 'World was not found.'))
         const copyWorld = Object.assign({ locked: false }, foundWorld._doc)
         copyWorld.locked = !!copyWorld.password
         delete copyWorld.password
         res.status(200).send(copyWorld)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.'))
      }
   },

   /**
    * Join a world controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   joinWorld: async ({ token, body: { _id, password } }, res) => {
      if (!_id) return res.status(400).send(responseError('missing-info', 'Missing information.'))
      try {
         const foundWorld = await services.fetchWorld(_id)
         if (!foundWorld) return res.status(404).send(responseError('world-not-found', 'World was not found.'))

         if (!foundWorld.members.includes(token._id) && foundWorld.owner !== token._id) {
            if (foundWorld.password) {
               if (!password) return res.status(400).send(responseError('missing-password', 'This world is locked and the password is missing.'))
               const passwordsMatch = await bcrypt.compare(password, foundWorld.password)
               if (!passwordsMatch) return res.status(422).send(responseError('wrong-password', 'This world is locked and the password is wrong.'))
            }
            const toBeUpdated = { $push: { members: token._id } }
            await services.modifyWorld(_id, toBeUpdated)
         }

         res.sendStatus(200)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   },

   /**
    * Leave a world controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   leaveWorld: async ({ token, body: { _id } }, res) => {
      if (!_id) return res.status(400).send(responseError('missing-info', 'Missing information.'))
      try {
         const foundWorld = await services.fetchWorld(_id)
         if (!foundWorld) return res.status(404).send(responseError('world-not-found', 'World was not found.'))
         if (!foundWorld.members.includes(token._id)) return res.status(400).send(responseError('not-in-world', 'You are not in this world.'))
         if (token._id === foundWorld.owner.toString()) return res.status(409).send(responseError('owner-cannot-leave', 'You can\'t leave your own world.'))

         const toBeUpdated = { $pull: { members: token._id } }
         await services.modifyWorld(_id, toBeUpdated)

         res.sendStatus(200)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   },

   /**
    * Search worlds controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   searchWorlds: async ({ token, body: { search = '', skip } }, res) => {
      try {
         const foundWorlds = await services.fetchWorlds({ name: RegExp(`^.*${search}.*$`, 'i') }, skip)

         const modifiedFoundWorlds = foundWorlds.map(world => {
            const newWorld = { ...world._doc }
            newWorld.locked = !!newWorld.password && !world.members.includes(token._id)
            delete newWorld.password
            return newWorld
         })

         res.status(200).send(modifiedFoundWorlds)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   }
}
