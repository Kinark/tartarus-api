const services = require('./services')
const responseError = require('~/app/responseError')

module.exports = {
   /**
    * Signup controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   signUp: async ({ body: { email, name, password } }, res) => {
      if (!email || !password || !name) return res.status(400).send(responseError('missing-info', 'Missing information.'))
      try {
         if (await services.findUserByEmail(email)) return res.status(400).send(responseError('already-exists', 'Email already in use.'))
         const newUser = await services.signUpUser(email, name, password)
         const userCopy = Object.assign({}, newUser._doc)
         delete userCopy.password
         res.status(201).send(userCopy)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.'))
      }
   },

   /**
    * JWT Controller
    * Needs to be called every 1 hour by the client, since it renews the logged in token.
    * @param {object} req - req object from express.
    * @param {string} req.cookies.jwt_token - The token itself
    * @param {object} res - res object from express.
    * @returns {void}
    */
   jwtRenewer: async ({ token, body: { email, password } }, res, next) => {
      // Check for JWT Token on cookies
      if (!token || (email && password)) return next()

      try {
         const decodedToken = services.decodeToken(token)
         if (!decodedToken) return res.status(401).send(responseError('invalid-token', 'Invalid or expired token'))
         const { _id, rememberMe } = decodedToken
         const foundUser = await services.findUserById(_id)
         const renewedToken = services.signToken({ _id, rememberMe }, { expiresIn: '5000' })
         // const renewedToken = services.signToken({ _id, rememberMe }, { expiresIn: rememberMe ? '7d' : '24h' })
         const foundUserCopy = Object.assign({}, foundUser._doc)
         delete foundUserCopy.password
         // Send the response
         return res.send({ token: renewedToken, ...foundUserCopy })
      } catch (err) {
         return res.status(422).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   },

   /**
    * Login controller
    * Logs user in and creates a cookie.
    * @param {object} req - req object from express.
    * @param {string} req.email - User's email.
    * @param {string} req.password - User's password.
    * @param {boolean} [req.rememberMe] - Should the session be remembered?.
    * @param {object} res - res object from express.
    * @returns {void}
    */
   login: async ({ body: { email, password, rememberMe } }, res) => {
      if (!email || !password) return res.status(400).send(responseError('missing-info', 'Missing email or password'))
      const dumbPassword = '$2b$10$8JkwIgvmHPI51XPvbzCrJOpiaS.OQ6iPUmnlGrqA9L6jQOSvUiGbW'

      try {
         const foundUser = await services.findUserByEmail(email)
         const hashesMatch = await services.comparePasswords(password, foundUser ? foundUser.password : dumbPassword)
         if (!foundUser || !hashesMatch) return res.status(422).send(responseError('wrong-info', 'Wrong email or password'))
         const token = services.signToken(
            { _id: foundUser._id, rememberMe },
            { expiresIn: process.env.NODE_ENV === 'development' ? '365d' : '5000' }
            // { expiresIn: process.env.NODE_ENV === 'development' ? '365d' : rememberMe ? '7d' : '24h' }
         )
         const foundUserCopy = Object.assign({}, foundUser._doc)
         delete foundUserCopy.password
         return res.send({ token, ...foundUserCopy })
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   },

   /**
    * Logout controller
    * Logs user out.
    * @returns {void}
    */
   logout: (req, res) => {
      if (!req.cookies.jwt_token || (req.body.email && req.body.password)) return res.sendStatus(200)
      res.clearCookie('jwt_token', req.cookies.jwt_token, {
         expires: req.cookies.jwt_token.exp,
         secure: process.env.NODE_ENV === 'production',
         httpOnly: true
      })
      res.sendStatus(200)
   },

   /**
    * Updates a user controller
    * @param {object} req - req object from express.
    * @param {object} res - res object from express.
    */
   updateUser: async ({ token, body: { ...rest } }, res) => {
      try {
         const toBeUpdated = { ...rest }
         delete toBeUpdated._id
         delete toBeUpdated.__v

         const modifiedUser = await services.modifyUser(token._id, toBeUpdated)
         res.status(200).send(modifiedUser)
      } catch (err) {
         return res.status(400).send(responseError('something-wrong', 'Something went wrong.', err.message))
      }
   }
}
