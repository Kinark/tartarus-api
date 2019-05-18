const app = module.exports = require('express')()
const controller = require('./controller')

app.post('/signup', controller.signUp)
app.post('/login', controller.jwtRenewer, controller.login)
// app.get('/logout', controller.logout)
