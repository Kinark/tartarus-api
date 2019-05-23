const mongoose = require('mongoose')

const Author = new mongoose.Schema({
   username: { type: String, required: true, trim: true },
   _id: { type: String, required: true, trim: true },
   avatar: { type: String, required: true, trim: true },
})

const MessageSchema = new mongoose.Schema({
   author: Author,
   content: { type: String, required: true, trim: true },
   room: { type: String, required: true, trim: true },
   type: { type: String, required: true, trim: true },
   subRoom: { type: String, required: true, trim: true },
   timestamp: { type: Date, required: true },
   nonce: { type: Date, required: true },
})

const Message = mongoose.model('Message', MessageSchema)

module.exports = Message
