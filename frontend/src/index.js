import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import Dialog from '@material-ui/core/Dialog';
import { Router, Route } from 'react-router';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import { List, ListItem } from '@material-ui/core/List';
import { createBrowserHistory } from 'history';
// import 'bootstrap/dist/css/bootstrap.css';
// import 'font-awesome/css/font-awesome.min.css';
import './style/style.css';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import D3app from './d3app';
import * as serviceWorker from './serviceWorker';

import { closeMessage } from './actions';
import reducer from './reducers';

import Posts from './containers/posts.jsx';
import Profiles from './containers/profiles.jsx';
import Categories from './containers/categories.jsx';
import Doc from './containers/doc.jsx';

const ENV = process.env.NODE_ENV || 'development';
const BASE_URI = '/';

const reduxMiddlewares = [thunkMiddleware];
if (ENV === 'development') {
  reduxMiddlewares.push(createLogger);
}
const store = createStore(
  reducer,
  applyMiddleware(...reduxMiddlewares),
);

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { history, message, dispatch } = this.props;
    return (
      <MuiThemeProvider>
        <div>
          <Drawer width={100} open={true} >
            <AppBar title="首页" style={{ padding: '0 16px' }} showMenuIconButton={false} titleStyle={{ cursor: 'pointer' }} onTitleTouchTap={() => { history.push('/'); }} />
            <List>
              <ListItem primaryText="文章" onClick={() => { history.push('/posts'); }} />
              <ListItem primaryText="公众号" onClick={() => { history.push('/profiles'); }} />
              <ListItem primaryText="分类" onClick={() => { history.push('/categories'); }} />
              <ListItem primaryText="配置" onClick={() => { history.push('/conf'); }} />
              <a href="https://github.com/lqqyt2423/wechat_spider" target="_blank" rel="noopener noreferrer"><ListItem primaryText="GitHub" /></a>
            </List>
          </Drawer>
          <div className="wrapper">
            {this.props.children}
          </div>
          <Dialog
            open={message.open}
            onRequestClose={() => {
              dispatch(closeMessage());
            }}
          >
            {message.content}
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

const connectedApp = connect((state) => state)(App);

const browserHistory = createBrowserHistory({
  basename: '/',
});

ReactDOM.render(
  (
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route path="/" component={connectedApp}>
          <Route exact path="/" component={Posts} />
          <Route path="/posts" component={Posts} />
          <Route path="/posts/:id" component={Doc} />
          <Route path="/posts/:id/edit" component={Doc} />
          <Route path="/profiles" component={Profiles} />
          <Route path="/profiles/:id" component={Doc} />
          <Route path="/profiles/:id/edit" component={Doc} />
          <Route path="/categories" component={Categories} />
          <Route path="/categories/:id" component={Doc} />
          <Route path="/categories/:id/edit" component={Doc} />
          <Route path="/conf" component={Doc} />
          <Route path="/conf/edit" component={Doc} />
        </Route>
      </Router>
    </Provider>
  ),
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
