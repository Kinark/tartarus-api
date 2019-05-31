const app = module.exports = require('express')()
const controller = require('./controller')
const middlewares = require('./middlewares')

app.post('/signup', controller.signUp)
app.post('/login', controller.jwtRenewer, controller.login)
app.patch('/user', middlewares.authAndDecode, controller.updateUser)
// app.get('/logout', controller.logout)
