const mongoose = require('mongoose');
const { fixUpdate } = require('../mongo');

const { Schema } = mongoose;

const MajorSchema = new Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
  },
  alias: {
    type: [String],
  },
}, {
  id: false,
  timestamps: { },
});

MajorSchema.plugin(fixUpdate);

module.exports = {
  MajorSchema,
  Major: mongoose.model('majors', MajorSchema),
};
