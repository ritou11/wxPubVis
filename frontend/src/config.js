// const ENV = process.env.NODE_ENV || 'development';
import { ApolloClient } from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

const apiurl = 'http://localhost:8104/api';
const config = {
  posts: `${apiurl}/posts`,
  post: `${apiurl}/posts`,
  profiles: `${apiurl}/profiles`,
  profile: `${apiurl}/profiles`,
  cates: `${apiurl}/categories`,
  cate: `${apiurl}/categories`,
  conf: `${apiurl}/conf`,
};

export default config;

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: 'http://localhost/api/graphql',
});

export const gqlClient = new ApolloClient({ cache, link });
