import React from 'react';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css';
import './App.css';

import { closeMessage } from './actions';

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
});

const styles = () => ({
  drawer: {
    width: 100,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 100,
  },
});

class App extends React.Component {
  render() {
    const { history, message, dispatch } = this.props;
    const { classes } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <Drawer className={classes.drawer}
            classes={{ paper: classes.drawerPaper }}
            open={true}
            variant={'persistent'}>
            <List>
              <ListItem button onClick={() => { history.push('/'); }}> 首页 </ListItem>
              <ListItem button onClick={() => { history.push('/posts'); }}> 文章 </ListItem>
              <ListItem button onClick={() => { history.push('/profiles'); }}> 公众号 </ListItem>
              <ListItem button onClick={() => { history.push('/vis'); }}> 可视化 </ListItem>
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

export default connect((state) => state)(withStyles(styles)(App));
