import ApolloClient, { gql } from 'apollo-boost';
import config from './config';

const client = new ApolloClient({
  uri: 'http://localhost/api/graphql',
});

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

export function receivePosts(posts) {
  return {
    type: RECEIVE_POSTS,
    posts,
  };
}

export function fetchPosts(query) {
  const path = assembleUrl(config.posts, query);
  return (dispatch) => {
    dispatch(requestPosts());
    return fetch(path).then((res) => res.json()).then((posts) => {
      dispatch(receivePosts(posts));
    });
  };
}

export const REQUEST_POST = 'REQUEST_POST';

export function requestPost(id) {
  return {
    type: REQUEST_POST,
    id,
  };
}

export const RECEIVE_POST = 'RECEIVE_POST';

export function receivePost(post) {
  return {
    type: RECEIVE_POST,
    post,
  };
}

export function fetchPost(id) {
  return (dispatch) => {
    dispatch(requestPost(id));
    return fetch(`${config.post}/${id}`).then((res) => res.json()).then((post) => {
      dispatch(receivePost(post));
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

export function receiveProfiles(data) {
  return {
    type: RECEIVE_PROFILES,
    profiles: {
      data,
    },
  };
}

export function fetchProfiles(query) {
  let skip = ((query.page - 1) * query.perPage) || 0;
  skip = +(skip > 0) && skip;
  return (dispatch) => {
    dispatch(requestProfiles());
    return client.query({
      query: gql`
        query {
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
        dispatch(receiveProfiles(data.profileList));
      });
  };
}

export const REQUEST_PROFILE = 'REQUEST_PROFILE';

export function requestProfile(id) {
  return {
    type: REQUEST_PROFILE,
    id,
  };
}

export const RECEIVE_PROFILE = 'RECEIVE_PROFILE';

export function receiveProfile(profile) {
  return {
    type: RECEIVE_PROFILE,
    profile,
  };
}

export function fetchProfile(id) {
  return (dispatch) => {
    dispatch(requestProfile(id));
    return fetch(`${config.profile}/${id}`).then((res) => res.json()).then((profile) => {
      dispatch(receiveProfile(profile));
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
