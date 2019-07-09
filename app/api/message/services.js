const Message = require('./model')

module.exports = {
   newMessage: async data => {
      const newMessage = new Message(data)
      const savedMessage = await newMessage.save()
      return Message.populate(savedMessage, { path: 'author', select: 'name' })
   },

   fetchByRoom: room => Message.find({ room }).populate('author', 'name')
}
