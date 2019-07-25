const app = (module.exports = require('express')())
const authMiddlewares = require('~/app/api/user/middlewares')
const controller = require('./controller')

app.post('/ruleset', authMiddlewares.authAndDecode, controller.createNewRuleset)
app.get('/ruleset/:_id', authMiddlewares.authAndDecode, controller.getRuleset)
app.patch('/ruleset/:_id', authMiddlewares.authAndDecode, controller.updateRuleset)

app.get('/my-rulesets', authMiddlewares.authAndDecode, controller.getMyRulesets)

// app.get('/world', authMiddlewares.reqWithJwt, controller.getMessages)
