const services = require('./services')
const responseError = require('~/app/responseError')

module.exports = {
   authAndDecode: (req, res, next) => {
      const { token } = req
      if (!token) return res.status(401).send(responseError('must-login', 'You must login first.'))
      try {
         const decoded = services.decodeToken(token)
         req.token = decoded
      } catch (error) {
         return res.status(401).send(responseError('invalid-token', 'Invalid or expired token sent.'))
      }
      return next()
   }
}
