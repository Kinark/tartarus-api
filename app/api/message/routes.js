const app = (module.exports = require('express')())
const authMiddlewares = require('~/app/api/user/middlewares')
const controller = require('./controller')

app.post('/message', controller.signUp)
app.get('/messages', authMiddlewares.reqWithJwt, controller.getMessages)
