// const ENV = process.env.NODE_ENV || 'development';
import { ApolloClient } from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

const argv = require('minimist')(process.argv.slice(2));

const apiHost = argv.apihost || 'wxpub-api.nogeek.top';

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: `http://${apiHost}/api/graphql`,
});

export const gqlClient = new ApolloClient({ cache, link });
