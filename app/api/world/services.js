const World = require('./model')

module.exports = {
   /**
    *Creates a new world
    * @param {string} owner - World's owner
    * @param {string} name - World's name
    * @param {string} [cover=''] - World's cover image
    * @param {string} password - World's password
    * @param {Array} tags - World's tags
    * @returns {object}
    */
   newWorld: (owner, name, cover = '', password, tags) => {
      const newWorld = new World({ owner, name, cover, password, tags, createdAt: new Date() })
      return newWorld.save()
   },

   /**
    * Fetch a world by it's _id
    * @param {string} _id - The world's _id
    * @returns {Promise}
    */
   fetchWorld: _id => World.findById(_id),

   /**
    * Fetch a worlds by owner
    * @param {string} owner - The owner's _id
    * @returns {Promise}
    */
   fetchWorldsByOwner: owner => World.find({ owner }),

   joinWorld: (memberId, worldId) => World.findByIdAndUpdate(worldId, { $push: { friends: memberId } }),

   destroyWorld: worldId => World.findByIdAndDelete(worldId),

   modifyWorld: (worldId, update) => World.findByIdAndUpdate(worldId, update, { new: true, runValidators: true })
}
