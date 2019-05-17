const services = require('./services')
const responseError = require('~/app/responseError')

module.exports = {
   reqWithJwt: (req, res, next) => {
      req.authToken = false
      if (!req.cookies.jwt_token) return next()
      const decoded = services.decodeToken(req.body.jwt)
      req.authToken = decoded
      return next()
   },
   onlyAuth: (req, res, next) => {
      if (!req.authToken) return res.status(401).send(responseError('unathorized', 'You must login first.'))
      return next()
   }
}
