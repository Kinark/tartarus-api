const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
   email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      validate: [validator.isEmail, 'Please fill a valid email address']
   },
   name: {
      type: String,
      required: true,
      trim: true
   },
   password: {
      type: String,
      required: true,
   },
   lastLogin: {
      type: Date,
   }
});

UserSchema.pre('save', function (next) {
   const user = this;
   bcrypt.hash(user.password, 10, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
   })
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
