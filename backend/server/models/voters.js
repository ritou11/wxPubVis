const mongoose = require('mongoose');
const { fixUpdate } = require('../mongo');

const { Schema } = mongoose;

const VoterSchema = new Schema({
  _id: {
    type: String,
  },
  code: {
    type: String,
  },
  sessionKey: {
    type: String,
  },
}, {
  id: false,
  timestamps: { },
});

VoterSchema.plugin(fixUpdate);

module.exports = {
  VoterSchema,
  Voter: mongoose.model('voters', VoterSchema),
};
