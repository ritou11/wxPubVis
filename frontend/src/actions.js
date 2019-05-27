import { gql } from 'apollo-boost';
import { ceil } from 'lodash';
import { gqlClient } from './config';

export function assembleUrl(path, params, method) {
  const fparams = params || {};
  const m = method ? method.toLowerCase() : 'get';
  let p = path;
  Object.keys(fparams).forEach((key) => {
    let _path = p.replace(`:${key}`, fparams[key]);
    if (_path === p) {
      if (m === 'get') {
        if (_path.indexOf('?') === -1) {
          _path = `${_path}?${key}=${fparams[key]}`;
        } else {
          _path = `${_path}&${key}=${fparams[key]}`;
        }
        delete fparams[key];
      }
    } else {
      delete fparams[key];
    }
    p = _path;
  });
  return p;
}

export const REQUEST_POSTS = 'REQUEST_POSTS';

export function requestPosts() {
  return {
    type: REQUEST_POSTS,
  };
}

export const RECEIVE_POSTS = 'RECEIVE_POSTS';

export function receivePosts(data, skip) {
  return {
    type: RECEIVE_POSTS,
    posts: {
      data: data.postList,
      metadata: {
        count: data.totalPost,
        totalPages: ceil(data.totalPost / 20),
        currentPage: ceil((skip + 1) / 20),
        perPage: 20,
      },
    },
  };
}

export function fetchPosts(query) {
  let skip = ((query.page - 1) * query.perPage) || 0;
  skip = +(skip > 0) && skip;
  return (dispatch) => {
    dispatch(requestPosts());
    return gqlClient.query({
      query: gql`
        query {
          totalPost( input:{
            ${query.msgBiz ? `msgBiz:"${query.msgBiz}"` : ''}
            ${query.mainData ? `hasData:${query.mainData}` : ''}
            ${query.q ? `search:"${query.q}"` : ''}
          } )
          postList(
            input:{
              ${query.msgBiz ? `msgBiz:"${query.msgBiz}"` : ''}
              skip:${skip}
              count:${query.perPage || 20}
              ${query.mainData ? `hasData:${query.mainData}` : ''}
              ${query.q ? `search:"${query.q}"` : ''}
              ${query.sortWay ? `sort:"${query.sortWay}"` : ''}
            }
          ) {
              pId
              title
              msgBiz
              msgIdx
              msgMid
              publishAt
              updatedAt
              likeNum
              readNum
              link
              senti
              profile {
                title
                headimg
              }
            }
          }`,
    })
      .then(({ data }) => {
        dispatch(receivePosts(data, skip));
      });
  };
}

export const REQUEST_PROFILES = 'REQUEST_PROFILES';

export function requestProfiles() {
  return {
    type: REQUEST_PROFILES,
  };
}

export const RECEIVE_PROFILES = 'RECEIVE_PROFILES';

export function receiveProfiles(data, skip) {
  return {
    type: RECEIVE_PROFILES,
    profiles: {
      data: data.profileList,
      metadata: {
        count: data.totalProfile,
        totalPages: ceil(data.totalProfile / 20),
        currentPage: ceil((skip + 1) / 20),
        perPage: 20,
      },
    },
  };
}

export function fetchProfiles(query) {
  let skip = ((query.page - 1) * query.perPage) || 0;
  skip = +(skip > 0) && skip;
  return (dispatch) => {
    dispatch(requestProfiles());
    return gqlClient.query({
      query: gql`
        query {
          totalProfile
          profileList(
            input:{
              skip:${skip}
              count:${query.perPage || 20}
            }
          ) {
              pId
              wechatId
              msgBiz
              headimg
              title
              postsAllCount
              postsDataCount
              createdAt
              updatedAt
            }
          }`,
    })
      .then(({ data }) => {
        dispatch(receiveProfiles(data, skip));
      });
  };
}

// message
export const SHOW_MESSAGE = 'SHOW_MESSAGE';
export const CLOSE_MESSAGE = 'CLOSE_MESSAGE';
let msgTimeout = null;
export function closeMessage() {
  return (dispatch) => {
    dispatch({ type: CLOSE_MESSAGE });
  };
}
export function showMessage(content) {
  return (dispatch) => {
    if (msgTimeout) {
      msgTimeout = null;
      clearTimeout(msgTimeout);
    }
    dispatch({ type: SHOW_MESSAGE, content });
    msgTimeout = setTimeout(() => {
      dispatch({ type: CLOSE_MESSAGE });
    }, 1000);
  };
}
