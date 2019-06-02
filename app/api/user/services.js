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
    * @returns {Object} - The found User
    */
   findUserByEmail: email => User.findOne({ email }),

   /**
    * Searches for a user with given id
    * @param {string} email - User's email
    * @returns {Object} - The found User
    */
   findUserById: _id => User.findById(_id),

   /**
    * Searches for a user with given object
    * @param {object} search - Object to search
    * @returns {Object} - The found User
    */
   findUser: search => User.findOne(search),

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
   decodeToken: token => jwt.verify(token, process.env.JWT_SECRET),

   /**
    * Fetch a user by it's _id
    * @param {string} _id - The user's _id
    * @returns {Promise}
    */
   fetchUser: _id => User.findById(_id),

   /**
    * Modifies an user
    * @param {string} userId - The user's _id
    * @param {string} update - The update to be made
    * @returns {Object} - Final user
    */
   modifyUser: (userId, update) => User.findByIdAndUpdate(userId, update, { new: true, runValidators: true })
}
