const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const WorldSchema = new mongoose.Schema({
   owner: { type: String, required: true },
   name: { type: String, required: true, trim: true },
   cover: { type: String, trim: true },
   description: { type: String, trim: true },
   members: { type: [String] },
   password: { type: String },
   createdAt: { type: Date, required: true },
   tags: { type: [String] }
})

WorldSchema.pre('save', function(next) {
   const world = this
   if(!world.password) next()
   bcrypt.hash(world.password, 10, (err, hash) => {
      if (err) return next(err)
      world.password = hash
      next()
   })
})

const World = mongoose.model('World', WorldSchema)

module.exports = World
