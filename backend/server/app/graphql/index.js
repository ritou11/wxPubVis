const _ = require('lodash');
const { makeExecutableSchema } = require('graphql-tools');
const fs = require('fs');
const { Comment } = require('../../models/comment');
const { Post } = require('../../models/post');
const { Profile } = require('../../models/profile');
const { ProfilePubRecord } = require('../../models/profilePubRecord');
const { project, resolvers } = require('./projection');

const typeDefs = fs.readFileSync('./docs/wechat.graphql', 'utf8');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: _.merge(
    resolvers, {
      Query: {
        async list(parent, { input }, context, info) {
          const proj = project(info);
          // isVoted/tickets need iId
          proj.iId = proj.iId || proj.isVoted || proj.tickets;
          let result;
          if (!input.search) {
            result = await Item.find({
              bId: input.bId,
            },
            proj,
            {
              skip: input.skip,
              limit: input.count,
              sort: 'iId',
            });
          } else {
            const authorIds = input.search.author ? await (async () => {
              const res = await Author.find({
                name: new RegExp(`${input.search.author}`),
              });
              return res && res.map((r) => r._id);
            })() : undefined;

            if (input.search.author && !authorIds) return [];

            const majorId = input.search.major ? await (async () => {
              const res = await Major.findOne({
                $or: [
                  { name: { $eq: input.search.major } },
                  { alias: { $elemMatch: { $eq: input.search.major } } },
                ],
              }, {
                _id: 1,
              });
              return res && res._id;
            })() : undefined;
            if (input.search.major && !majorId) return [];

            const query = {
              bId: input.bId,
            };
            if (input.search.iId) query.iId = input.search.iId;
            if (authorIds) query.authors = { $in: authorIds };
            if (majorId) query.majors = majorId;
            result = await Item.find(query,
              proj, {
                skip: input.skip,
                limit: input.count,
                sort: 'iId',
              });
          }
          if (result) {
            return result.map((r) => r && Object.assign({}, r.toObject(), {
              token: input.token,
              bId: input.bId,
            }));
          }
          return result;
        },
        async item(parent, { input }, context, info) {
          const proj = project(info);
          let result = await Item.findOne({
            bId: input.bId,
            iId: input.iId,
          }, proj);
          result = result && result.toObject();
          if (result) {
            return Object.assign({}, result, {
              token: input.token,
              bId: input.bId,
              iId: input.iId,
            });
          }
          return result;
        },
        async majors(parent, args, context, info) {
          const proj = project(info);
          const result = await Major.find().select(proj);
          if (result) result.map((r) => r && r.toObject());
          return result;
        },
        async ballot(parent, { input }, context, info) {
          const proj = project(info);
          const result = await Ballot.findOne({
            _id: { $eq: input.bId },
          }, proj);
          return result && result.toObject();
        },
        async myTickets(parent, { input }) {
          if (await checkSession(input.token.openId, input.token.code)) {
            const res = await Vote.findOne({
              bId: input.bId,
              token: input.token.openId,
            });
            return res ? res.items.length : 0;
          }
          return 0;
        },
      },
      Mutation: {
        async openSession(parent, { input }) {
          const res = await jscode2Session(input.code);
          if (res.errCode) {
            return {
              errMsg: res.errMsg,
            };
          }
          const { openId, sessionKey } = res;
          if (!(openId && sessionKey)) {
            return {
              errMsg: 'Error',
            };
          }
          writeSession(openId, input.code, sessionKey);
          return {
            errMsg: 'ok',
            openId,
          };
        },
        async vote(parent, { input }) {
          if (!await checkSession(input.token.openId, input.token.code)) { return 'Auth error'; }
          const ballot = await Ballot.findOne({
            _id: { $eq: input.bId },
          });
          if (!ballot) return 'No ballot';
          const maxTickets = ballot.maxTickets || 3;
          if (maxTickets <= 0) return 'Vote closed';
          const vote = await Vote.findOne({
            bId: input.bId,
            token: input.token.openId,
          });
          if (!vote) {
            const ivote = await Vote.create({
              _id: `${input.token.openId}_${input.bId}`,
              bId: input.bId,
              token: input.token.openId,
              items: [{
                iId: input.iId,
                createdAt: new Date(),
              }],
            });
            return ivote ? 'ok' : 'Insert error';
          }
          const n = vote.items.length;
          if (n >= maxTickets) return 'Exceed limit';
          for (let i = 0; i < n; i += 1) {
            if (vote.items[i].iId === input.iId) return 'Already voted';
          }
          vote.items.push({
            iId: input.iId,
            createdAt: new Date(),
          });
          const uvote = await vote.save();
          return uvote ? 'ok' : 'Save error';
        },
      },
      Item: {
        async author(parent, args, context, info) {
          const proj = project(info);
          if (_.keys(proj).length === 1) {
            return parent.authors.map((id) => ({ _id: id }));
          }
          // console.log(parent.authors);
          await Item.populate(parent, { path: 'authors', select: proj });
          // console.log(parent.authors, proj);
          return parent.authors;
        },
        async tickets(parent) {
          const res = await Vote.find({
            bId: { $eq: parent.bId },
            items: { $elemMatch: { iId: { $eq: parent.iId } } },
          }).count();
          return res;
        },
        async isVoted(parent) {
          if (parent.token && await checkSession(parent.token.openId, parent.token.code)) {
            const res = await Vote.findOne({
              token: { $eq: parent.token.openId },
              bId: { $eq: parent.bId },
              items: { $elemMatch: { iId: { $eq: parent.iId } } },
            });
            console.log();
            return Boolean(res);
          }
          return false;
        },
      },
      Author: {
        async major(parent, args, context, info) {
          const proj = project(info);
          if (_.keys(proj).length === 1) {
            return { _id: parent.major };
          }
          await Author.populate(parent, { path: 'major', select: proj });
          return parent.major;
        },
      },
    },
  ),
});

module.exports = {
  resolvers,
  schema,
};
