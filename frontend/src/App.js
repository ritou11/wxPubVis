import React from 'react';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import { List, ListItem } from '@material-ui/core/List';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css';
import './style/style.css';

import { closeMessage } from './actions';

class App extends React.Component {
  render() {
    const { history, message, dispatch } = this.props;
    return (
      <MuiThemeProvider>
        <div>
          <Drawer width={100} open={true} >
            <AppBar title="首页"
              style={{ padding: '0 16px' }}
              showMenuIconButton={false}
              titleStyle={{ cursor: 'pointer' }}
              onTitleTouchTap={() => { history.push('/'); }}
            />
            <List>
              <ListItem primaryText="文章" onClick={() => { history.push('/posts'); }} />
              <ListItem primaryText="公众号" onClick={() => { history.push('/profiles'); }} />
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

export default connect((state) => state)(App);
