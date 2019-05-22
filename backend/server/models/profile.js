const { Schema } = require('mongoose');

// 数据结构：公众号账号
const ProfileSchema = new Schema({
  // 公众号标题 name
  title: String,
  // 公众号 id
  wechatId: String,
  // 公众号介绍
  desc: String,
  // 公众号标志
  msgBiz: String,
  // 公众号头像
  headimg: String,
  // 上次打开历史页面的时间
  openHistoryPageAt: Date,
  // 省份
  province: String,
  // 城市
  city: String,
  // 发布的第一篇文章的发布当天 0 点的时间
  firstPublishAt: Date,
  // 无关的字段，可忽略
  property: String,
});

ProfileSchema.plugin(require('motime'));

ProfileSchema.index({ msgBiz: 1 }, { unique: true });

module.exports = {
  ProfileSchema,
  Profile: mongoose.model('Profile', ProfileSchema),
};
