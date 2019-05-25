const gqlProjection = require('graphql-advanced-projection');

module.exports = gqlProjection({
  Post: {
    proj: {
      pId: '_id',
      profile: 'msgBiz',
    },
  },
  Profile: {
    proj: {
      pId: '_id',
      postsAllCount: null,
      postsDataCount: null,
    },
  },
});
