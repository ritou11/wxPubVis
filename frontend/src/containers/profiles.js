import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';

import { fetchProfiles } from '../actions';
import Loading from '../components/loading';
import Paginator from '../components/paginator';
import Search from './search';

const styles = {
  root: {
    flex: 1,
  },
};

class Profiles extends React.Component {
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
        <Search
          location={location}
          history={history}
          searchArgs={this.returnCurrentSearchArgs()}
          defaultText="搜索公众号..."
        />
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>更新时间</th>
              <th>头像</th>
              <th>公众号</th>
              <th>文章数</th>
              <th>有数据</th>
              <th>差</th>
              <th>MsgBiz</th>
              <th>详情</th>
            </tr>
          </thead>
          <tbody>
            {
              profiles.data.map((profile) => (
                <tr key={profile.pId}>
                  <td>{profile.pId}</td>
                  <td>{profile.updatedAt ? moment(profile.updatedAt).format('YY-MM-DD HH:mm') : ''}</td>
                  <td><img
                    style={{ height: '24px', marginRight: '3px' }}
                    src={profile.headimg}
                    alt={`${profile.title}.headimg`}
                    className="img-circle" /></td>
                  <td><Link to={`/posts?msgBiz=${profile.msgBiz}`}>{profile.title}</Link></td>
                  <td>{profile.postsAllCount}</td>
                  <td>{profile.postsDataCount}</td>
                  <td>{profile.postsAllCount - profile.postsDataCount}</td>
                  <td>{profile.msgBiz}</td>
                  <td><Link to={`/profiles/${profile.id}`}>详情</Link></td>
                </tr>
              ))
            }
          </tbody>
        </table>
        <Paginator { ...metadata } history={ history } search={ search } pathname={ pathname } ></Paginator>
      </div>
    );
  }
}

export default connect((state) => state)(withStyles(styles)(Profiles));
