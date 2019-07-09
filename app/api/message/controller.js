const services = require('./services')
const userServices = require('../user/services')
const io = require('~/app/server').io
// const worldServices = require('../world/services')
const responseError = require('~/app/responseError')

module.exports = {
   roll: async (req, res, next) => {
      if (!/^([0-9]+d[0-9]+\s?)+$/.test(req.body.dices.join(' '))) res.status(400).send(responseError('wrong-dices', 'Something is wrong with those dices'))

      const maxDiceTypes = 5
      const maxDicesPerType = 10
      const maxDiceSides = 100

      const dices = req.body.dices.map(dice => dice.split('d'))

      if (
         dices.length > maxDiceTypes ||
         dices.every(currentDice => currentDice[0] > maxDicesPerType) ||
         dices.every(currentDice => currentDice[1] > maxDiceSides)
      ) return res.status(400).send(responseError('too-many-dices', 'Too many dices were requested to be rolled'))

      let sumDetails = []
      let result = 0

      dices.forEach(dice => {
         const dicesAmount = dice[0]
         const diceType = dice[1]
         for (let index = 0; index < dicesAmount; index++) {
            const diceResult = Math.floor(Math.random() * diceType + 1)
            sumDetails.push(diceResult)
            result += diceResult
         }
      })

      req.body.content = result
      req.body.dicesResults = sumDetails

      next()
   },
   createNewMessage: async ({ token, body }, res) => {
      const { currentSocket } = await userServices.findUserById(token._id)
      const msgObject = {
         ...body,
         author: token._id,
         timestamp: Date.now()
      }
      const newMessage = await services.newMessage(msgObject)

      if (currentSocket) {
         io.sockets.connected[currentSocket].broadcast.to(msgObject.room).emit('message', newMessage)
      } else {
         io.to(msgObject.room).emit('message', newMessage)
      }

      res.status(201).send(newMessage)
   },
   getMessagesOfRoom: async ({ params: { room } }, res) => {
      const messages = await services.fetchByRoom(room)
      res.status(200).send(messages)
   }
}
