const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('./model')

module.exports = {
   /**
    * Signs up a new user
    * @param {string} email - User's email
    * @param {string} name - User's name
    * @param {string} password - User's password
    * @returns {object} - The new user
    */
   signUpUser: async (email, name, password) => {
      const newUser = new User({ email, name, password })
      try {
         return await newUser.save()
      } catch (err) {
         throw new Error(err)
      }
   },

   /**
    * Searches for a user with given email
    * @param {string} email - User's email
    * @returns {object}
    */
   findUser: async email => {
      try {
         return await User.findOne({ email })
      } catch (err) {
         throw new Error('Error while finding user.')
      }
   },

   /**
    * Compares two passwords
    * @param {string} passwordA
    * @param {string} passwordB
    * @returns {boolean}
    */
   comparePasswords: async (passwordA, passwordB) => {
      try {
         return await bcrypt.compare(passwordA, passwordB)
      } catch (err) {
         throw new Error('Error while comparing passwords.')
      }
   },

   /**
    * Signs tokens
    * @param {object} data - The data to be signed
    * @param {string} expiresIn - When it's going to expire
    * @returns {string} - The token
    */
   signToken: (data, options) => jwt.sign(data, process.env.JWT_SECRET, options),

   /**
    * Decodes tokens
    * @param {string} token
    * @returns {object} - Decoded token
    */
   decodeToken: async token => {
      try {
         return await jwt.verify(token, process.env.JWT_SECRET)
      } catch (err) {
         throw new Error('Error while decoding token.')
      }
   }
}
