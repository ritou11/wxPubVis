const { Schema } = require('mongoose');

// 公众号的发布文章记录
const ProfilePubRecordSchema = new Schema({
  // 公众号
  msgBiz: { type: String, required: true },
  // 日期 包含每一天 定义为每天 0 点
  date: { type: Date, required: true },
  // 发布次数 0 - 未发布 1 - 当日发布一次（居多） 2 - 以此类推
  pubCount: { type: Number, default: 0 },
  // 发布的总条数
  postCount: { type: Number, default: 0 },
});

ProfilePubRecordSchema.plugin(require('motime'));

ProfilePubRecordSchema.index({ msgBiz: 1, date: 1 }, { unique: true });

module.exports = {
  ProfilePubRecordSchema,
  ProfilePubRecord: mongoose.model('ProfilePubRecord', ProfilePubRecordSchema),
};
