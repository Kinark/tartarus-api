const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('./model')

module.exports = {
   /**
    * Signs up a new user
    * @param {string} email - User's email
    * @param {string} name - User's name
    * @param {string} password - User's password
    * @returns {Object} - The new user
    */
   signUpUser: async (email, name, password) => {
      const newUser = new User({ email, name, password })
      return newUser.save()
   },

   /**
    * Searches for a user with given email
    * @param {string} email - User's email
    * @returns {Object}
    */
   findUser: email => User.findOne({ email }),

   /**
    * Searches for a user with given id
    * @param {string} email - User's email
    * @returns {Object}
    */
   findUserById: _id => User.findById(_id),

   /**
    * Compares two passwords
    * @param {string} passwordA
    * @param {string} passwordB
    * @returns {boolean}
    */
   comparePasswords: async (passwordA, passwordB) => bcrypt.compare(passwordA, passwordB),

   /**
    * Signs tokens
    * @param {Object} data - The data to be signed
    * @param {string} expiresIn - When it's going to expire
    * @returns {string} - The token
    */
   signToken: (data, options) => jwt.sign(data, process.env.JWT_SECRET, options),

   /**
    * Decodes tokens
    * @param {string} token
    * @returns {Object} - Decoded token
    */
   decodeToken: token => jwt.verify(token, process.env.JWT_SECRET)
}
