import {
  REQUEST_POSTS,
  RECEIVE_POSTS,
  REQUEST_PROFILES,
  RECEIVE_PROFILES,
  SHOW_MESSAGE,
  CLOSE_MESSAGE,
} from './actions';

const initialState = {
  posts: {},
  post: {},
  profiles: {},
  profile: {},
  cates: {},
  cate: {},
  isFetching: false,
  message: {
    open: false,
    content: '',
  },
  // crawl server side config
  conf: {},
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_POSTS:
    case REQUEST_PROFILES:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECEIVE_POSTS:
      return Object.assign({}, state, {
        isFetching: false,
        posts: action.posts,
      });
    case RECEIVE_PROFILES:
      return Object.assign({}, state, {
        isFetching: false,
        profiles: action.profiles,
      });
    case SHOW_MESSAGE:
      return {
        ...state,
        message: {
          open: true,
          content: action.content,
        },
      };
    case CLOSE_MESSAGE:
      return {
        ...state,
        message: {
          open: false,
          content: '',
        },
      };
    default:
      return state;
  }
}

export default reducer;
