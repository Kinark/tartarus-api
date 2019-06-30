const app = (module.exports = require('express')())
const authMiddlewares = require('~/app/api/user/middlewares')
const controller = require('./controller')

app.post('/world', authMiddlewares.authAndDecode, controller.createNewWorld)
app.patch('/world', authMiddlewares.authAndDecode, controller.updateWorld)
app.get('/world/:_id', authMiddlewares.authAndDecode, controller.getWorld)
app.delete('/world', authMiddlewares.authAndDecode, controller.deleteWorld)

app.get('/my-worlds', authMiddlewares.authAndDecode, controller.getMyWorlds)

app.patch('/join-world', authMiddlewares.authAndDecode, controller.joinWorld)
app.patch('/leave-world', authMiddlewares.authAndDecode, controller.leaveWorld)
app.post('/search-worlds', authMiddlewares.authAndDecode, controller.searchWorlds)

// app.get('/world', authMiddlewares.reqWithJwt, controller.getMessages)
