const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const MessageSchema = new mongoose.Schema({
   author: { type: ObjectId, required: true, ref: 'User' },
   content: { type: String, required: true, trim: true },
   room: { type: ObjectId, required: true, ref: 'World' },
   type: { type: String, required: true, enum: ['adventure', 'talk'] },
   subRoom: { type: String, trim: true },
   timestamp: { type: Date, required: true },
   nonce: { type: String, required: true }
})

const Message = mongoose.model('Message', MessageSchema)

module.exports = Message
