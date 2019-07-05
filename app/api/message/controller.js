const services = require('./services')
const userServices = require('../user/services')
const io = require('~/app/server').io
// const worldServices = require('../world/services')
// const responseError = require('~/app/responseError')

module.exports = {
   createNewMessage: async ({ token, body }, res) => {
      const { name, currentSocket } = await userServices.findUserById(token._id)
      const msgObject = {
         ...body,
         author: {
            username: name,
            _id: token._id
         },
         timestamp: Date.now()
      }
      const newMessage = await services.newMessage(msgObject)
      
      if(currentSocket) {
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
