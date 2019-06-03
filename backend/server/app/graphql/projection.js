const gqlProjection = require('graphql-advanced-projection');

module.exports = gqlProjection({
  Post: {
    proj: {
      pId: '_id',
      profile: 'msgBiz',
      senti: 'comSenti',
    },
  },
  Profile: {
    proj: {
      pId: '_id',
      postsAllCount: null,
      postsDataCount: null,
    },
  },
  PostThemes: {
    proj: {
      pId: 'pid',
    },
  },
});
