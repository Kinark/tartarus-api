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
   newWorld: ({ owner, name, ruleset, description, cover, password, tags }) => {
      const newWorld = new World({ owner, name, description, ruleset: ruleset || null, cover: cover || '', password, tags, createdAt: new Date() })
      return newWorld.save()
   },

   /**
    * Fetch a world by it's _id
    * @param {string} _id - The world's _id
    * @returns {Promise}
    */
   fetchWorld: _id => World.findById(_id),

   /**
    * Search for worlds
    * @param {string} query - The query for to search the worlds
    * @returns {Promise}
    */
   fetchWorlds: (query, skip = 0) => World.find(query).skip(skip).limit(50),

   /**
    * Fetch a worlds by owner
    * @param {string} owner - The owner's _id
    * @returns {Promise}
    */
   fetchWorldsByOwner: owner => World.find({ owner }),

   joinWorld: (memberId, worldId) => World.findByIdAndUpdate(worldId, { $push: { members: memberId } }),

   destroyWorld: worldId =>
      World.findByIdAndDelete(worldId, function(err, world) {
         world.remove()
      }),

   modifyWorld: (worldId, update) => World.findByIdAndUpdate(worldId, update, { new: true, runValidators: true })
}
