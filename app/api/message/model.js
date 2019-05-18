const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
   author: { type: String, required: true, trim: true },
   content: { type: String, required: true, trim: true },
   world: { type: String, required: true, trim: true },
   type: { type: String, required: true, trim: true },
   creationDate: { type: Date, required: true },
})

const Message = mongoose.model('Message', MessageSchema)

module.exports = Message
