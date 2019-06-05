import React, { Component } from 'react';
// import { map, filter, sortBy } from 'lodash';
import { withStyles } from '@material-ui/core/styles';

import { Query, ApolloProvider } from 'react-apollo';
import { gql } from 'apollo-boost';
import { gqlClient } from '../config';

import Loading from '../components/loading';
import PostCard from '../components/postCard';

const styles = {
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
  },
};

class PostVis extends Component {
  state = {
    msgBiz: '',
  };

  render() {
    const { location } = this.props;
    const { query } = location;
    return (
      <div>
        <ApolloProvider client={gqlClient}>
          <Query
            query={gql`
              {
                post(
                  input:{
                    pId:"${query.pid}"
                  }
                ) {
                  title
                  digest
                  publishAt
                  readNum
                  likeNum
                  cover
                  link
                  sourceUrl
                  profile {
                    title
                    headimg
                  }
                  related {
                    pId
                    info {
                      title
                    }
                    simi
                  }
                }
              }
            `}
          >
            {({ loading, error, data }) => {
              if (loading) return <Loading />;
              if (error || !data || !data.post) return <p>Error :(</p>;
              const { post } = data;
              console.log(post);
              return (
                <PostCard data={post}/>
              );
            }}
          </Query>
        </ApolloProvider>
      </div>
    );
  }
}

export default withStyles(styles)(PostVis);
