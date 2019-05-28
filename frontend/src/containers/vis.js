import React, { Component } from 'react';
import { map, filter, sortBy } from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import { Query, ApolloProvider } from 'react-apollo';
import { gql } from 'apollo-boost';
import { gqlClient } from '../config';

import Loading from '../components/loading';
import VisReadnumLine from '../components/visReadnumLine';
import VisActivityLine from '../components/visActivityLine';

const styles = {
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
  },
};

const colormap = (n) => {
  let b;
  if (!n) return 'hsl(0,0%,80%)';
  if (n < 0.5) b = 0;
  else b = (n - 0.5) * 2;
  return `hsl(0,${b * 100}%,${50 * b}%)`;
};

class Vis extends Component {
  state = {
    msgBiz: '',
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <ApolloProvider client={gqlClient}>
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
                  senti
                  }
              }
            `}
          >
            {({ loading, error, data }) => {
              if (loading) return <Loading />;
              if (error) return <p>Error :(</p>;
              const nestedData = sortBy(
                filter(map(data.postList, (d) => {
                  if (d.readNum && d.publishAt) {
                    return ({
                      x: new Date(d.publishAt),
                      y: d.readNum - 1,
                      name: d.title,
                      color: colormap(d.senti),
                    });
                  }
                  return null;
                })), (d) => d.x,
              );
              return (
                <VisReadnumLine
                  height={400}
                  width={900}
                  title={this.state.title}
                  data={nestedData}
                />
              );
            }}
          </Query>
          <Query
            query={gql`
              {
                profile(input: {
                  msgBiz:"${this.state.msgBiz}"
                }) {
                  title
                  activity {
                    publishAt
                    score
                  }
                }
              }
            `}
          >
            {({ loading, error, data }) => {
              if (loading) return <Loading />;
              if (error) return <p>Error :(</p>;
              const nestedData = data.profile && sortBy(
                filter(map(data.profile.activity, (d) => {
                  if (d.publishAt && d.score) {
                    return ({
                      x: new Date(d.publishAt),
                      y: d.score,
                    });
                  }
                  return null;
                })), (d) => d.x,
              );
              return (
                <VisActivityLine
                  height={400}
                  width={900}
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
                    if (loading) return <Loading />;
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
