const mongoose = require('mongoose');
const { fixUpdate } = require('../mongo');

const { Schema } = mongoose;

const BallotSchema = new Schema({
  _id: {
    type: String,
  },
  icon: {
    type: String,
  },
  title: {
    type: String,
  },
  maxTickets: {
    type: Number,
  },
}, {
  id: false,
  timestamps: { },
});

BallotSchema.plugin(fixUpdate);

module.exports = {
  BallotSchema,
  Ballot: mongoose.model('ballots', BallotSchema),
};
