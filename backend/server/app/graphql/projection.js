const gqlProjection = require('graphql-advanced-projection');

module.exports = gqlProjection({
  // Item
  Item: {
    proj: {
      author: { query: 'authors' },
      tickets: null,
      isVoted: null,
    },
  },

  // Item > Author
  Author: {
    proj: {
      aId: '_id',
      major: { query: 'major' },
    },
  },

  // Major, Item > Author > Major
  Major: {
    proj: {
      mId: '_id',
    },
  },
});
