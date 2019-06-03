const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostThemeByProfileSchema = new Schema({
  name: String,
  weight: Number,
  contrib: Number,
});

const PubpostSchema = new Schema({
  pid: String,
  msgBiz: String,
  themes: [PostThemeByProfileSchema],
}, { toJSON: { virtuals: true } });

module.exports = {
  PubpostSchema,
  Pubpost: mongoose.model('Pubpost', PubpostSchema),
};
