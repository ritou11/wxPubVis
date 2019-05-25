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
          msgBiz: input.msgBiz,
        }, proj);
        result = result && result.toObject();
        return result;
      },
      async postList(parent, { input }, context, info) {
        const proj = project(info);
        if (input.count === 0) return null;
        const query = {};
        if (input.msgBiz) {
          query.msgBiz = { $eq: input.msgBiz };
        }
        if (input.hasData !== undefined) {
          query.readNum = { $exists: input.hasData };
        }
        if (input.search) {
          query.title = { $regex: `.*${input.search}.*` };
        }
        let sort;
        if (input.sort) {
          switch (input.sort) {
            case 'publishAt':
              sort = { publishAt: 1 };
              break;
            case '-publishAt':
              sort = { publishAt: -1 };
              break;
            case 'updatedAt':
              sort = { updatedAt: 1 };
              break;
            case '-updatedAt':
            default:
              sort = { updatedAt: -1 };
              break;
          }
        }
        const result = await Post.find(query,
          proj,
          {
            skip: input.skip || 0,
            limit: input.count === -1 ? 0 : (input.count || 20),
            sort,
          });
        if (result) {
          return result.map((r) => r && r.toObject());
        }
        return result;
      },
      async totalPost(parent, { input }) {
        const query = {};
        if (input.msgBiz) {
          query.msgBiz = { $eq: input.msgBiz };
        }
        if (input.hasData !== undefined) {
          query.readNum = { $exists: input.hasData };
        }
        if (input.search) {
          query.title = { $regex: `.*${input.search}.*` };
        }
        const res = await Post.find(query).count();
        return res;
      },
      async profileList(parent, { input }, context, info) {
        const proj = project(info);
        if (input.count === 0) return null;
        const query = {};
        if (input.search) {
          query.title = { $regex: `.*${input.search}.*` };
        }
        const result = await Profile.find(query,
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
      async totalProfile(parent, { input }) {
        const query = {};
        if (input && input.search) {
          query.title = { $regex: `.*${input.search}.*` };
        }
        const res = await Profile.find(query).count();
        return res;
      },
    },
    Post: {
      async profile(parent, args, context, info) {
        const proj = project(info);
        let result = await Profile.findOne({
          msgBiz: parent.msgBiz,
        }, proj);
        result = result && result.toObject();
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
