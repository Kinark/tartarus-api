const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const Input = new mongoose.Schema({
   posX: { type: Number, required: true },
   posY: { type: Number, required: true },
   width: { type: Number, required: true },
   height: { type: Number, required: true },
   fontSize: { type: String, trim: true }
})

const RulesetSchema = new mongoose.Schema({
   owner: { type: ObjectId, required: true },
   name: { type: String, required: true, trim: true },
   bgImg: { type: String, trim: true },
   inputs: { type: [Input] },
})

const Ruleset = mongoose.model('Ruleset', RulesetSchema)

module.exports = Ruleset
