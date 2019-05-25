import React from 'react';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

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
  root: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
  },
  drawer: {
    width: 120,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 120,
  },
  wrapper: {
    boxSizing: 'border-box',
    width: '100%',
    padding: '0 10px',
    margin: '10px auto',
    display: 'flex',
  },
});

class App extends React.Component {
  render() {
    const { history, message, dispatch } = this.props;
    const { classes } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <Drawer className={classes.drawer}
            classes={{ paper: classes.drawerPaper }}
            open={true}
            variant={'persistent'}>
            <List>
              <ListItem button onClick={() => { history.push('/'); }}>
                <ListItemText primary="首页" />
              </ListItem>
              <ListItem button onClick={() => { history.push('/posts'); }}>
                <ListItemText primary="推送数据" />
              </ListItem>
              <ListItem button onClick={() => { history.push('/profiles'); }}>
                <ListItemText primary="公众号数据" />
              </ListItem>
              <ListItem button onClick={() => { history.push('/colorana'); }}>
                <ListItemText primary="D3实例" />
              </ListItem>
              <ListItem button onClick={() => { history.push('/vis'); }}>
                <ListItemText primary="公众号可视化" />
              </ListItem>
            </List>
          </Drawer>
          <div className={classes.wrapper}>
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
