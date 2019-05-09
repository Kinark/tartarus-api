const jwt = require('jsonwebtoken')

module.exports = {
   reqWithJwt: (req, res, next) => {
      req.authToken = false
      if (!req.cookies.jwt_token) return next()
      return jwt.verify(req.cookies.jwt_token, process.env.JWT_SECRET, (err, decoded) => {
         if (err) return next()
         req.authToken = decoded
         return next()
      })
   },
   onlyAuth: (req, res, next) => {
      if (!req.authToken) return res.status(401).send({ msg: 'You must login first.' })
      return next()
   }
}
