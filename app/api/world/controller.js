const bcrypt = require('bcrypt')
const World = require('./model')
const userServices = require('../user/services')
const services = require('./services')
const responseError = require('~/app/responseError')
const io = require('~/app/server').io

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
         const myWorlds = await services.fetchWorlds({ owner: token._id })

         const modifiedMyWorlds = myWorlds.map(world => {
            const newWorld = { ...world._doc }
            newWorld.locked = !!newWorld.password && !world.members.some(member => member.user._id.toString() === token._id)
            delete newWorld.password
            return newWorld
         })

         res.status(200).send(modifiedMyWorlds)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.'))
      }
   },

   /**
    * Fetch worlds where I live controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   getWhereILive: async ({ token }, res) => {
      try {
         const worldsWhereILive = await services.fetchWorlds({ owner: { $ne: token._id }, 'members.user': token._id })

         const modifiedMyWorlds = worldsWhereILive.map(world => {
            const newWorld = { ...world._doc }
            newWorld.locked = !!newWorld.password && !world.members.some(member => member.user._id.toString() === token._id)
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
   getWorld: async ({ token, params: { _id } }, res) => {
      try {
         if (!_id) return res.status(400).send(responseError('missing-info', 'Missing information.'))
         const foundWorld = await services.fetchWorld(_id)
         if (!foundWorld) return res.status(404).send(responseError('world-not-found', 'World was not found.'))
         const copyWorld = Object.assign({ locked: false }, foundWorld._doc)
         copyWorld.locked = !!copyWorld.password && !copyWorld.members.some(member => member.user._id.toString() === token._id)
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
      const { currentSocket } = await userServices.findUserById(token._id)
      try {
         const foundWorld = await services.fetchWorld(_id)
         // const foundUser = await User.findById(_id)
         if (!foundWorld) return res.status(404).send(responseError('world-not-found', 'World was not found.'))

         if (!foundWorld.members.some(member => member.user._id.toString() === token._id) && foundWorld.owner !== token._id) {
            if (foundWorld.password) {
               if (!password) return res.status(400).send(responseError('missing-password', 'This world is locked and the password is missing.'))
               const passwordsMatch = await bcrypt.compare(password, foundWorld.password)
               if (!passwordsMatch) return res.status(422).send(responseError('wrong-password', 'This world is locked and the password is wrong.'))
            }

            const savedFoundWorld = await World.findOneAndUpdate({ _id }, { $push: { members: { user: token._id } } }, { new: true })
            const populatedSavedFoundWorld = await World.populate(savedFoundWorld, { path: 'members.user', select: '-password -email' })
            const newPlayer = { player: populatedSavedFoundWorld.members.find(({ user }) => user._id.toString() === token._id), room: _id }

            console.log(currentSocket)
            if (currentSocket) {
               io.sockets.connected[currentSocket].broadcast.to(_id).emit('new-player', newPlayer)
            } else {
               io.to(_id).emit('new-player', newPlayer)
            }
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
      const { currentSocket } = await userServices.findUserById(token._id)
      try {
         const foundWorld = await services.fetchWorld(_id)
         if (!foundWorld) return res.status(404).send(responseError('world-not-found', 'World was not found.'))
         if (!foundWorld.members.some(member => member.user._id.toString() === token._id)) {
            return res.status(400).send(responseError('not-in-world', 'You are not in this world.'))
         }
         if (token._id === foundWorld.owner.toString()) return res.status(409).send(responseError('owner-cannot-leave', "You can't leave your own world."))

         const subdocumentId = foundWorld.members.find(member => member.user._id.toString() === token._id)._id
         foundWorld.members.id(subdocumentId).remove()
         await foundWorld.save()

         const quittingPlayer = { room: _id, player: token._id }

         if (currentSocket) {
            io.sockets.connected[currentSocket].broadcast.to(_id).emit('quitting-player', quittingPlayer)
         } else {
            io.to(_id).emit('quitting-player', quittingPlayer)
         }

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
            newWorld.locked = !!newWorld.password && !world.members.some(member => member.user._id.toString() === token._id)
            delete newWorld.password
            return newWorld
         })

         res.status(200).send(modifiedFoundWorlds)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   },

   /**
    * Search worlds controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   giveSheet: async ({ token, body: { playerId, rulesetId, type }, params: { _id } }, res) => {
      try {
         console.log(playerId)
         const foundWorld = await services.fetchWorld(_id)
         if (!foundWorld) return res.status(404).send(responseError('world-not-found', 'World was not found.'))
         if (token._id !== foundWorld.owner.toString()) return res.status(403).send(responseError('not-owner', 'You are not the owner of the world.'))

         const newCharacter = { name: 'Nova ficha', ruleset: rulesetId, type, sheetInputs: [] }

         const doc = await World.findOneAndUpdate(
            { _id, 'members.user': playerId },
            { $push: { 'members.$.characters': newCharacter } },
            { new: true }
         ).populate('members.user', '-password -email')
         const updatedMember = doc.members.find(member => member.user._id.toString() === playerId)

         io.to(_id).emit('updated-member', { room: _id, updatedMember })

         res.status(200).send(doc)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   }
}
