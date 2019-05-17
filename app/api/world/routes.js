const app = (module.exports = require('express')())
const authMiddlewares = require('~/app/api/user/middlewares')
const controller = require('./controller')

app.post('/world', controller.signUp)
app.get('/world', authMiddlewares.reqWithJwt, controller.getMessages)
