const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const Author = new mongoose.Schema({
   username: { type: String, required: true, trim: true },
   _id: { type: ObjectId, required: true, trim: true },
   avatar: { type: String, trim: true },
})

const MessageSchema = new mongoose.Schema({
   author: Author,
   content: { type: String, required: true, trim: true },
   room: { type: ObjectId, required: true, trim: true },
   type: { type: String, required: true, enum: ['adventure', 'talk'] },
   subRoom: { type: String, trim: true },
   timestamp: { type: Date, required: true },
   nonce: { type: String, required: true },
})

const Message = mongoose.model('Message', MessageSchema)

module.exports = Message
