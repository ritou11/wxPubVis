const { Schema } = require('mongoose');

const CommentSchema = new Schema({
  postId: { type: 'ObjectId', ref: 'Post' },
  contentId: String,
  nickName: String,
  logoUrl: String,
  content: String,
  createTime: Date,
  likeNum: Number,
  replies: [{
    content: String,
    createTime: Date,
    likeNum: Number,
  }],
});

CommentSchema.plugin(require('motime'));

CommentSchema.index({ contentId: 1 }, { unique: true });

module.exports = {
  CommentSchema,
  Comment: mongoose.model('Comment', CommentSchema),
};
