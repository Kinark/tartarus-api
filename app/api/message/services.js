const World = require('./model')

module.exports = {
   /**
    *Creates a new world
    * @param {string} owner - World's owner
    * @param {string} name - World's name
    * @param {string} [cover=''] - World's cover image
    * @param {string} password - World's password
    * @param {Array} tags - World's tags
    * @returns
    */
   newWorld: async (owner, name, cover = '', password, tags) => {
      const newWorld = new World({ owner, name, cover, password, tags })
      try {
         return await newWorld.save()
      } catch (err) {
         throw new Error(err)
      }
   },
   fetchWorld: async id => {
      try {
         return await World.findById(id)
      } catch (err) {
         throw new Error('Error while finding world.')
      }
   }
}
