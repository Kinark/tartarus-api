const app = (module.exports = require('express')())
const authMiddlewares = require('~/app/api/user/middlewares')
const controller = require('./controller')

app.post('/roll', authMiddlewares.authAndDecode, controller.roll, controller.createNewMessage)
app.post('/message', authMiddlewares.authAndDecode, controller.createNewMessage)
app.get('/messages/:room', authMiddlewares.authAndDecode, controller.getMessagesOfRoom)
