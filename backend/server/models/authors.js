const mongoose = require('mongoose');
const { fixUpdate } = require('../mongo');

const { Schema } = mongoose;

const AuthorSchema = new Schema({
  _id: {
    type: Schema.ObjectId,
  },
  name: {
    type: String,
  },
  major: {
    type: String,
    ref: 'majors',
    index: true,
  },
  number: {
    type: String,
  },
}, {
  id: false,
  timestamps: { },
});

AuthorSchema.plugin(fixUpdate);

module.exports = {
  AuthorSchema,
  Author: mongoose.model('authors', AuthorSchema),
};
