const gqlProjection = require('graphql-advanced-projection');

module.exports = gqlProjection({
  Post: {
    proj: {
      pId: '_id',
    },
  },
  Profile: {
    proj: {
      pId: '_id',
    },
  },
});
