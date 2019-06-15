import React from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { round } from 'lodash';
import { Query, ApolloProvider } from 'react-apollo';
import { gql } from 'apollo-boost';
import { gqlClient } from '../config';

import { fetchPosts, assembleUrl } from '../actions';
import Loading from '../components/loading';
import Paginator from '../components/paginator';
import PostCard from '../components/postCard';
import Search from './search';

function timeDiff(update, publish) {
  const updateMoment = moment(update);
  const publishMoment = moment(publish);
  const days = updateMoment.diff(publishMoment, 'days');
  if (days < 31) return `${days}天`;
  const months = updateMoment.diff(publishMoment, 'months');
  if (months < 13) return `${months}月`;
  const years = updateMoment.diff(publishMoment, 'years');
  return `${years}年`;
}

const styles = {
  root: {
    display: 'flex',
    flex: 1,
  },
  col1: {
    flex: 10,
  },
  col2: {
    flex: 1,
  },
};

class Posts extends React.Component {
  state = {
    pId: '5ce1507c4877ed43338112e1',
  }

  componentDidMount() {
    const { dispatch, location } = this.props;
    dispatch(fetchPosts(location.query));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      const { dispatch } = this.props;
      dispatch(fetchPosts(nextProps.location.query));
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

  sortBy(sortType) {
    const { location, history } = this.props;
    const { search, pathname } = location;
    const searchArgs = this.returnCurrentSearchArgs();
    let iconClass = 'fa-sort';
    let nextSortType = `-${sortType}`;
    if (search && search.indexOf('?') === 0) {
      if (searchArgs.sortWay) {
        if (searchArgs.sortWay === sortType) {
          iconClass = 'fa-sort-asc';
          nextSortType = `-${sortType}`;
        }
        if (searchArgs.sortWay === `-${sortType}`) {
          iconClass = 'fa-sort-desc';
          nextSortType = sortType;
        }
      }
    }
    const nextQuery = Object.assign({}, searchArgs, {
      sortWay: nextSortType,
    });
    const path = assembleUrl(pathname, nextQuery);
    return (<i onClick={() => { history.push(path); }} className={`fa ${iconClass}`}></i>);
  }

  judeMainDataShow(key) {
    const searchArgs = this.returnCurrentSearchArgs();
    const mainDataVal = searchArgs.mainData;
    const primary = { color: 'primary' };
    if (key === 'all' && !mainDataVal) return primary;
    if (key === 'yes' && mainDataVal === 'true') return primary;
    if (key === 'no' && mainDataVal === 'false') return primary;
    return null;
  }

  renderFilter() {
    const { location, history, posts } = this.props;
    const { pathname } = location;
    const searchArgs = this.returnCurrentSearchArgs();
    const style = {
      margin: '0px 15px 10px 0',
    };
    const { metadata } = posts;
    const { count } = metadata || {};
    return (
      <div>
        <Button {...this.judeMainDataShow('all')} onClick={() => {
          const nextQuery = { ...searchArgs };
          delete nextQuery.mainData;
          const path = assembleUrl(pathname, nextQuery);
          history.push(path);
        }} style={style} variant="contained"> 全部数据 </Button>
        <Button {...this.judeMainDataShow('yes')} onClick={() => {
          const nextQuery = { ...searchArgs, mainData: 'true' };
          const path = assembleUrl(pathname, nextQuery);
          history.push(path);
        }} style={style} variant="contained"> 有阅读量 </Button>
        <Button {...this.judeMainDataShow('no')} onClick={() => {
          const nextQuery = { ...searchArgs, mainData: 'false' };
          const path = assembleUrl(pathname, nextQuery);
          history.push(path);
        }} style={style} variant="contained"> 无阅读量 </Button>
        { !count ? '' : <span>共{count}条数据</span> }
      </div>
    );
  }

  render() {
    const { isFetching, posts, history, location, classes } = this.props;
    const { search, pathname } = location;
    if (isFetching || !posts.data) return <Loading />;
    const { metadata } = posts;

    // show
    const showData = posts.data.map((i) => {
      let showTitle = (i.title && i.title.substr(0, 25)) || '暂无';
      if (i.link) {
        showTitle = <a title={i.title} href={i.link} rel="noopener noreferrer" target="_blank">{showTitle}</a>;
      } else {
        showTitle = <span>{showTitle}</span>;
      }
      return {
        pId: i.pId,
        publishAt: i.publishAt ? moment(i.publishAt).format('YY-MM-DD HH:mm') : '暂无',
        showTitle,
        msgIdx: i.msgIdx || '0',
        readNum: i.readNum || '',
        likeNum: i.likeNum || '',
        updatedAt: i.updatedAt ? moment(i.updatedAt).format('YY-MM-DD HH:mm') : '暂无',
        updateInterval: (i.updatedAt && i.publishAt) ? timeDiff(i.updatedAt, i.publishAt) : '',
        showProfile: <Link to={`/posts?msgBiz=${i.msgBiz}`}>
          {i.profile ? (<span>
            <img style={{ height: '24px', marginRight: '3px' }}
              src={i.profile.headimg}
              alt={`${i.profile.title}.headimg`}
              className="img-circle" />
            {i.profile.title}
          </span>) : i.msgBiz}</Link>,
        senti: round(i.senti, 2),
      };
    });

    return (
      <div className={classes.root}>
        <div className={classes.col2}>
          <ApolloProvider client={gqlClient}>
            <Query
              query={gql`
                {
                  post(
                    input:{
                      pId:"${this.state.pId}"
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
                      pId:"${this.state.pId}"
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
        <div className={classes.col1}>
          {this.renderFilter()}
          <Search
            location={location}
            history={history}
            searchArgs={this.returnCurrentSearchArgs()}
            defaultText="搜索文章..."
          />
          <table className="table table-striped">
            <thead>
              <tr>
                <th>发布时间 {this.sortBy('publishAt')}</th>
                <th>文章标题</th>
                <th>位置</th>
                <th>阅读数 {this.sortBy('readNum')}</th>
                <th>点赞数 {this.sortBy('likeNum')}</th>
                <th>公众号</th>
                <th>可视化</th>
              </tr>
            </thead>
            <tbody>
              {
                showData.map((i) => (
                  <tr key={i.pId}>
                    <td>{i.publishAt}</td>
                    <td>{i.showTitle}</td>
                    <td>{i.msgIdx}</td>
                    <td>{i.readNum}</td>
                    <td>{i.likeNum}</td>
                    <td>{i.showProfile}</td>
                    <td><Link
                      component="button"
                      variant="body2"
                      onClick={() => {
                        this.setState({
                          pId: i.pId,
                        });
                      }}>详情</Link>
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

export default connect((state) => state)(withStyles(styles)(Posts));
