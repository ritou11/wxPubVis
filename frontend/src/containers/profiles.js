import React from 'react';
import { connect } from 'react-redux';
import { map, filter, sortBy } from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { Query, ApolloProvider } from 'react-apollo';
import { gql } from 'apollo-boost';
import { gqlClient } from '../config';

import { fetchProfiles } from '../actions';
import Loading from '../components/loading';
import VisReadnumLine from '../components/visReadnumLine';
import VisActivityLine from '../components/visActivityLine';
import VisPerpub from '../components/visPerpub';
import Paginator from '../components/paginator';
import Search from './search';

const colormap = (n) => {
  let b;
  if (!n) return 'hsl(0,0%,80%)';
  if (n < 0.5) b = 0;
  else b = (n - 0.5) * 2;
  return `hsl(0,${b * 100}%,${50 * b}%)`;
};

const styles = {
  root: {
    display: 'flex',
    flex: 1,
  },
  col1: {
    flex: 1,
  },
  col2: {
    flex: 1,
    minWidth: '800px',
  },
};

class Profiles extends React.Component {
  state = {
    msgBiz: 'MzUxODM4OTYzMg==',
  }

  constructor(props) {
    super(props);
    this.returnCurrentSearchArgs = this.returnCurrentSearchArgs.bind(this);
  }

  componentDidMount() {
    const { dispatch, location } = this.props;
    dispatch(fetchProfiles(location.query));
  }

  // eslint-disable-next-line
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      const { dispatch } = this.props;
      dispatch(fetchProfiles(nextProps.location.query));
    }
  }

  returnCurrentSearchArgs() {
    const { location } = this.props;
    const { search } = location;
    const searchArgs = {};
    search.replace('?', '').split('&').forEach((item) => {
      const key = item.split('=')[0];
      const value = item.replace(`${key}=`, '');
      if (key && value) searchArgs[key] = value;
    });
    return searchArgs;
  }

  render() {
    const { isFetching, profiles, history, location, classes } = this.props;
    const { search, pathname } = location;
    if (isFetching || !profiles.data) return <Loading />;
    const { metadata } = profiles;
    return (
      <div className={classes.root}>
        <div className={classes.col2}>
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
                    height={350}
                    width={800}
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
                    height={350}
                    width={800}
                    title={this.state.title}
                    data={nestedData}
                  />
                );
              }}
            </Query>
            <Query
              query={gql`
              {
                profileThemes(input: {
                  msgBiz:"${this.state.msgBiz}"
                }) {
                  themes {
                    importance
                    name
                    keywords
                  }
                }
              }
            `}
            >
              {({ loading, error, data }) => {
                if (loading) return <Loading />;
                if (error || !data || !data.profileThemes) return <p>Error :(</p>;
                return (
                  <VisPerpub
                    data={data.profileThemes.themes}
                    settings={{
                      width: 800,
                      height: 350,
                    }}
                  />
                );
              }}
            </Query>
          </ApolloProvider>
        </div>
        <div className={classes.col1}>
          <Search
            location={location}
            history={history}
            searchArgs={this.returnCurrentSearchArgs()}
            defaultText="搜索公众号..."
          />
          <table className="table table-striped">
            <thead>
              <tr>
                <th>头像</th>
                <th>公众号</th>
                <th>文章数</th>
                <th>有数据</th>
                <th>差</th>
                <th>MsgBiz</th>
                <th>可视化</th>
              </tr>
            </thead>
            <tbody>
              {
                profiles.data.map((profile) => (
                  <tr key={profile.pId}>
                    <td><img
                      style={{ height: '24px', marginRight: '3px' }}
                      src={profile.headimg}
                      alt={`${profile.title}.headimg`}
                      className="img-circle" /></td>
                    <td>
                      <Button
                        onClick={() => {
                          history.push(`/posts?msgBiz=${profile.msgBiz}`);
                        }}
                        color="primary">
                        {profile.title}
                      </Button>
                    </td>
                    <td>{profile.postsAllCount}</td>
                    <td>{profile.postsDataCount}</td>
                    <td>{profile.postsAllCount - profile.postsDataCount}</td>
                    <td>{profile.msgBiz}</td>
                    <td>
                      <Button
                        onClick={() => {
                          this.setState({
                            msgBiz: profile.msgBiz,
                          });
                        }}
                        color="primary">
                        详情
                      </Button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <Paginator { ...metadata } history={ history } search={ search } pathname={ pathname } ></Paginator>
        </div>
      </div>
    );
  }
}

export default connect((state) => state)(withStyles(styles)(Profiles));
