const _ = require('lodash');
const { makeExecutableSchema } = require('graphql-tools');
const fs = require('fs');
const { Comment } = require('../../models/comment');
const { Post } = require('../../models/post');
const { Profile } = require('../../models/profile');
const { ProfilePubRecord } = require('../../models/profilePubRecord');
const { project, resolvers } = require('./projection');

const typeDefs = fs.readFileSync('./docs/wxPubAnal.graphql', 'utf8');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: _.merge(resolvers, {
    Query: {
      async post(parent, { input }, context, info) {
        const proj = project(info);
        let result = await Post.findOne({
          _id: input.pId,
        }, proj);
        result = result && result.toObject();
        return result;
      },
      async profile(parent, { input }, context, info) {
        const proj = project(info);
        let result = await Profile.findOne({
          _id: input.pId,
        }, proj);
        result = result && result.toObject();
        return result;
      },
      async profileList(parent, { input }, context, info) {
        const proj = project(info);
        if (input.count === 0) return null;
        const result = await Profile.find({},
          proj,
          {
            skip: input.skip || 0,
            limit: input.count === -1 ? 0 : input.count,
          });
        if (result) {
          return result.map((r) => r && r.toObject());
        }
        return result;
      },
    },
    Profile: {
      async postsAllCount(parent) {
        const res = await Post.find({
          msgBiz: { $eq: parent.msgBiz },
        }).count();
        return res;
      },
      async postsDataCount(parent) {
        const res = await Post.find({
          msgBiz: { $eq: parent.msgBiz },
          readNum: { $exists: true },
        }).count();
        return res;
      },
    },
  }),
});

module.exports = {
  resolvers,
  schema,
};
