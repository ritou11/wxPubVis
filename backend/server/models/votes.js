const mongoose = require('mongoose');
const { fixUpdate } = require('../mongo');

const { Schema } = mongoose;

const VoteItemSchema = new Schema({
  iId: {
    type: Number,
  },
  createdAt: {
    type: Date,
  },
}, {
  _id: false,
  id: false,
});

const VoteSchema = new Schema({
  _id: {
    type: String,
  },
  bId: {
    type: String,
  },
  token: {
    type: String,
  },
  items: {
    type: [VoteItemSchema],
  },
}, {
  id: false,
  timestamps: { },
});

VoteSchema.index({ bId: 1, token: 1 }, { unique: true });
VoteSchema.index({ 'items.iId': 1 });

VoteSchema.plugin(fixUpdate);

module.exports = {
  VoteItemSchema,
  VoteSchema,
  Vote: mongoose.model('votes', VoteSchema),
};
