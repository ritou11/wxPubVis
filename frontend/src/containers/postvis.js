import React, { Component } from 'react';
// import { map, filter, sortBy } from 'lodash';
import { withStyles } from '@material-ui/core/styles';

import { Query, ApolloProvider } from 'react-apollo';
import { gql } from 'apollo-boost';
import { gqlClient } from '../config';

import Loading from '../components/loading';
import PostCard from '../components/postCard';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'row',
  },
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
    const { location, classes } = this.props;
    const { query } = location;
    return (
      <div className={classes.root}>
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
                      readNum
                      likeNum
                      senti
                    }
                    simi
                  }
                }
                postThemes(
                  input:{
                    pId:"${query.pid}"
                  }
                ) {
                  theme
                  words {
                    name
                    freq
                  }
                  weight
                }
              }
            `}
          >
            {({ loading, error, data }) => {
              if (loading) return <Loading />;
              if (error || !data || !data.post) return <p>Error :(</p>;
              return (
                <div>
                  <PostCard data={data}/>
                </div>
              );
            }}
          </Query>
        </ApolloProvider>
      </div>
    );
  }
}

export default withStyles(styles)(PostVis);
