const Message = require('./model')

module.exports = {
   newMessage: ({ author, content, room, type, subRoom, timestamp, nonce }) => {
      const newMessage = new Message({ author, content, room, type, subRoom, timestamp, nonce })
      return newMessage.save()
   },

   fetchByRoom: room =>  Message.find({ room })
}
