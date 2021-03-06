import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { Route, Router } from 'react-router';
import { createBrowserHistory } from 'history';
import qhistory from 'qhistory';
import { stringify, parse } from 'qs';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import D3app from './d3app';
import App from './App';
import * as serviceWorker from './serviceWorker';

import reducer from './reducers';

import Posts from './containers/posts';
import Profiles from './containers/profiles';
import Vis from './containers/vis';
import PostVis from './containers/postvis';

const ENV = process.env.NODE_ENV || 'development';

const reduxMiddlewares = [thunkMiddleware];
if (ENV === 'development') {
  reduxMiddlewares.push(createLogger);
}
const store = createStore(
  reducer,
  applyMiddleware(...reduxMiddlewares),
);

const browserHistory = qhistory(
  createBrowserHistory({ basename: '/' }),
  stringify,
  parse,
);

ReactDOM.render(
  (
    <Provider store={store}>
      <App history={browserHistory}>
        <Router history={browserHistory}>
          <Route exact path="/" component={Profiles} />
          <Route path="/posts" component={Posts} />
          <Route path="/profiles" component={Profiles} />
          <Route path="/colorana" component={D3app} />
          <Route path="/postvis" component={PostVis} />
          <Route path="/vis" component={Vis} />
        </Router>
      </App>
    </Provider>
  ),
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
