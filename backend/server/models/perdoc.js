const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostWordSchema = new Schema({
  name: String,
  freq: Number,
});

const PostThemeSchema = new Schema({
  theme: String,
  weight: Number,
  words: [PostWordSchema],
});

const PerdocSchema = new Schema({
  pid: String,
  themes: [PostThemeSchema],
}, { toJSON: { virtuals: true } });

module.exports = {
  PerdocSchema,
  Perdoc: mongoose.model('Perdoc', PerdocSchema, 'perdoc'),
};
