const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
   owner: { type: String, required: true },
   name: { type: String, required: true, trim: true },
   cover: { type: String, trim: true },
   members: { type: [String] },
   password: { type: String },
   creationDate: { type: Date, required: true },
   tags: { type: [String] }
})

UserSchema.pre('save', function(next) {
   const user = this
   bcrypt.hash(user.password, 10, (err, hash) => {
      if (err) return next(err)
      user.password = hash
      next()
   })
})

const User = mongoose.model('User', UserSchema)

module.exports = User
