const mongoose = require('mongoose');
const { fixUpdate } = require('../mongo');

const { Schema } = mongoose;

const ItemSchema = new Schema({
  _id: {
    type: String,
  },
  bId: {
    type: String,
  },
  iId: {
    type: Number,
  },
  image: {
    type: String,
  },
  title: {
    type: String,
  },
  intro: {
    type: String,
  },
  brief: {
    type: String,
  },
  authors: {
    type: [{
      type: Schema.ObjectId,
      ref: 'authors',
    }],
    index: true,
  },
  majors: {
    type: [{
      type: String,
      ref: 'majors',
    }],
    index: true,
  },
}, {
  id: false,
  timestamps: { },
});

ItemSchema.index({ bId: 1, iId: 1 }, { unique: 1 });
/*
ItemSchema.index({ title: 'text' });
ItemSchema.index({ intro: 'text' });
ItemSchema.index({ brief: 'text' });
*/
ItemSchema.plugin(fixUpdate);

module.exports = {
  ItemSchema,
  Item: mongoose.model('items', ItemSchema),
};
