// const ENV = process.env.NODE_ENV || 'development';
import { ApolloClient } from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

const apiHost = process.env.API_HOST || 'wxpub-api.nogeek.top';

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: `https://${apiHost}/api/graphql`,
});

export const gqlClient = new ApolloClient({ cache, link });
