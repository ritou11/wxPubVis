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
  resolvers: _.merge(
    resolvers, {
    },
  ),
});

module.exports = {
  resolvers,
  schema,
};
