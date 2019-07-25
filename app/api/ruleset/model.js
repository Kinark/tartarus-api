const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const Input = new mongoose.Schema({
   nonce: { type: Number, required: true },
   x: { type: Number, required: true },
   y: { type: Number, required: true },
   width: { type: Number, required: true },
   height: { type: Number, required: true },
   fontSize: { type: String, trim: true },
   pageNonce: { type: Number, required: true },
   type: { type: String, required: true }
})

const Page = new mongoose.Schema({
   nonce: { type: Number, required: true, default: 0 },
   bgImg: { type: String, trim: true, default: '' },
   bgWidth: { type: Number, trim: true, default: 720 }
})

const RulesetSchema = new mongoose.Schema({
   owner: { type: ObjectId, required: true, ref: 'User' },
   name: { type: String, required: true, trim: true },
   pages: [Page],
   inputs: [{ type: Input, default: [] }]
})

const Ruleset = mongoose.model('Ruleset', RulesetSchema)

module.exports = Ruleset
