import React, { Component } from 'react';
import { map, filter, sortBy } from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

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
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
  },
};

class Vis extends Component {
  state = {
    msgBiz: '',
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <ApolloProvider client={client}>
          <Query
            query={gql`
              {
                postList(
                  input:{
                    msgBiz:"${this.state.msgBiz}"
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
                  height={500}
                  width={1000}
                  title={this.state.title}
                  data={nestedData}
                />
              );
            }}
          </Query>
          <Drawer className={classes.drawer}
            classes={{ paper: classes.drawerPaper }}
            open={true}
            variant="persistent"
            anchor="right">
            <Query
              query={gql`
                {
                  profileList(
                    input:{
                      skip:0
                      count:20
                    }
                  ) {
                      title
                      msgBiz
                      headimg
                    }
                }
              `}
            >
              {({ loading, error, data }) => (
                <List>
                  {(() => {
                    if (loading) return <ListItem>Loading...</ListItem>;
                    if (error) return <ListItem>Error :(</ListItem>;
                    return map(data.profileList, (d) => (
                      <ListItem button
                        key={d.msgBiz}
                        onClick={() => {
                          this.setState({
                            msgBiz: d.msgBiz,
                            title: d.title,
                          });
                        }}>
                        <ListItemIcon>
                          <img
                            style={{ height: '24px', marginRight: '3px' }}
                            src={d.headimg}
                            alt={`${d.title}.headimg`}
                            className="img-circle" />
                        </ListItemIcon>
                        <ListItemText primary={d.title} />
                      </ListItem>
                    ));
                  })()}
                </List>
              )}
            </Query>
          </Drawer>
        </ApolloProvider>
      </div>
    );
  }
}

export default withStyles(styles)(Vis);
