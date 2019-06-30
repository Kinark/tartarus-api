const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const ObjectId = mongoose.Schema.Types.ObjectId

const Message = require('../message/model')

const WorldSchema = new mongoose.Schema({
   owner: { type: ObjectId, required: true },
   name: { type: String, required: true, trim: true },
   cover: { type: String, trim: true },
   description: { type: String, trim: true },
   ruleset: { type: ObjectId },
   members: { type: [ObjectId] },
   activeMembers: { type: [ObjectId] },
   password: { type: String },
   createdAt: { type: Date, required: true },
   tags: { type: [String] }
})

WorldSchema.pre('save', function(next) {
   const world = this
   if (!world.password) next()
   bcrypt.hash(world.password, 10, (err, hash) => {
      if (err) return next(err)
      world.password = hash
      next()
   })
})

WorldSchema.pre('remove', function(next) {
   Message.deleteMany({ room: this._id }).exec()
   next()
})

const World = mongoose.model('World', WorldSchema)

module.exports = World
