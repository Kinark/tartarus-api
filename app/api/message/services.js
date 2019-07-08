const Message = require('./model')

module.exports = {
   newMessage: async ({ author, content, room, type, subRoom, timestamp, nonce }) => {
      const newMessage = new Message({ author, content, room, type, subRoom, timestamp, nonce })
      const savedMessage = await newMessage.save()
      return Message.populate(savedMessage, { path: 'author', select: 'name' })
   },

   fetchByRoom: room => Message.find({ room }).populate('author', 'name')
}
