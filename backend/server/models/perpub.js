const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProfileThemeSchema = new Schema({
  name: String,
  importance: Number,
  keywords: [String],
});

const PerpubSchema = new Schema({
  msgBiz: String,
  themes: [ProfileThemeSchema],
}, { toJSON: { virtuals: true } });

module.exports = {
  PerpubSchema,
  Perpub: mongoose.model('Perpub', PerpubSchema, 'perpub'),
};
