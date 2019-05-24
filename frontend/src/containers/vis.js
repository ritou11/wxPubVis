import React, { Component } from 'react';
import { map, filter, sortBy } from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import { Query, ApolloProvider } from 'react-apollo';
import { ApolloClient, gql } from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

import VisReadnumLine from '../components/visReadnumLine';

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: 'http://localhost/api/graphql',
});
const client = new ApolloClient({ cache, link });
const styles = {
  root: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
  },
};

class Vis extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Query
          query={gql`
            {
              postList(
                input:{
                  msgBiz:"MzUxODM4OTYzMg=="
                  skip:0
                  count:-1
                }
              ) {
                title
                publishAt
                readNum
                }
            }
          `}
        >
          {({ loading, error, data }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error :(</p>;
            const nestedData = sortBy(
              filter(map(data.postList, (d) => {
                if (d.readNum && d.publishAt) {
                  return ({
                    x: new Date(d.publishAt),
                    y: d.readNum - 1,
                    name: d.title,
                  });
                }
                return null;
              })), (d) => d.x,
            );
            return (
              <VisReadnumLine
                height={400}
                width={800}
                title={'清华小五爷园'}
                data={nestedData}
              />
            );
          }}
        </Query>
      </ApolloProvider>
    );
  }
}

export default withStyles(styles)(Vis);
