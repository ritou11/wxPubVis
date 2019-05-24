const _ = require('lodash');
const { makeExecutableSchema } = require('graphql-tools');
const fs = require('fs');
// const { Comment } = require('../../models/comment');
const { Post } = require('../../models/post');
const { Profile } = require('../../models/profile');
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
      async postList(parent, { input }, context, info) {
        const proj = project(info);
        if (input.count === 0) return null;
        const query = input.msgBiz ? {
          msgBiz: { $eq: input.msgBiz },
        } : {};
        const result = await Post.find(query,
          proj,
          {
            skip: input.skip || 0,
            limit: input.count === -1 ? 0 : input.count,
          });
        // TODO: sort
        if (result) {
          return result.map((r) => r && r.toObject());
        }
        return result;
      },
      async totalPost(parent, { input }) {
        const query = input.msgBiz ? {
          msgBiz: { $eq: input.msgBiz },
        } : {};
        const res = await Post.find(query).count();
        return res;
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
        // TODO: sort
        if (result) {
          return result.map((r) => r && r.toObject());
        }
        return result;
      },
      async totalProfile() {
        const res = await Profile.find().count();
        return res;
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
