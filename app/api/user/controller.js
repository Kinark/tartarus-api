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
         if (await services.findUser(email)) return res.status(400).send(responseError('already-exists', 'Email already in use.'))
         const newUser = await services.signUpUser(email, name, password)
         const userCopy = Object.assign({}, newUser._doc)
         delete userCopy.password
         res.status(201).send(userCopy)
      } catch (err) {
         if (err.code === 11000) return res.status(400).send(responseError('already-exists', 'Email already in use.'))
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
   jwtRenewer: async ({ cookies: { jwt_token }, body: { email, password } }, res, next) => {
      // Check for JWT Token on cookies
      if (!jwt_token || (email && password)) return next()

      try {
         const decoded = await services.decodeToken(jwt_token)
         const { _id, rememberMe } = await services.decodeToken(jwt_token)
         console.log(decoded)
         const renewedToken = services.signToken({ _id, rememberMe }, { expiresIn: rememberMe ? '7d' : '24h' })
         // Set the cookie
         res.cookie('jwt_token', renewedToken, {
            expires: rememberMe ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : 0,
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true
         })
         // Send the response
         return res.send({ token: renewedToken })
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
         const foundUser = await services.findUser(email)
         const hashesMatch = await services.comparePasswords(password, foundUser ? foundUser.password : dumbPassword)
         if (!foundUser || !hashesMatch) return res.status(422).send(responseError('wrong-info', 'Wrong email or password'))
         const token = services.signToken({ _id: foundUser._id, rememberMe }, { expiresIn: rememberMe ? '7d' : '24h' })
         res.cookie('jwt_token', token, {
            expires: rememberMe ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : 0,
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true
         })
         return res.send({ token })
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
   }
}
