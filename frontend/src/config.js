// const ENV = process.env.NODE_ENV || 'development';
import { ApolloClient } from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

const { log } = console;
const apiHost = process.env.REACT_APP_API_HOST || 'https://wxpub-api.nogeek.top';
log(`API host: ${process.env.REACT_APP_API_HOST}`);

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: `${apiHost}/api/graphql`,
});

export const gqlClient = new ApolloClient({ cache, link });
