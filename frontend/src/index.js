import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { Route, Router } from 'react-router';
import { createBrowserHistory } from 'history';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import D3app from './d3app';
import App from './App';
import * as serviceWorker from './serviceWorker';

import reducer from './reducers';

import Posts from './containers/posts.jsx';
import Profiles from './containers/profiles.jsx';
import Doc from './containers/doc.jsx';

const ENV = process.env.NODE_ENV || 'development';

const reduxMiddlewares = [thunkMiddleware];
if (ENV === 'development') {
  reduxMiddlewares.push(createLogger);
}
const store = createStore(
  reducer,
  applyMiddleware(...reduxMiddlewares),
);

const browserHistory = createBrowserHistory({
  basename: '/',
});

ReactDOM.render(
  (
    <Provider store={store}>
      <Router history={browserHistory}>
        <App>
          <Route exact path="/" component={Posts} />
          <Route path="/posts" component={Posts} />
          <Route path="/posts/:id" component={Doc} />
          <Route path="/posts/:id/edit" component={Doc} />
          <Route path="/profiles" component={Profiles} />
          <Route path="/profiles/:id" component={Doc} />
          <Route path="/profiles/:id/edit" component={Doc} />
          <Route path="/vis" component={D3app} />
        </App>
      </Router>
    </Provider>
  ),
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
