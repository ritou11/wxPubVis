import React from 'react';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

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
    flexDirection: 'column',
  },
  appBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flexGrow: 1,
    marginRight: '32px',
    textAlign: 'right',
  },
  drawer: {
    width: 180,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 180,
  },
  wrapper: {
    boxSizing: 'border-box',
    width: '100%',
    padding: '0 10px',
    margin: '10px auto',
    display: 'flex',
  },
  listitemicon: {
    margin: 'auto',
  },
});

class App extends React.Component {
  state = {
    tabvalue: 0,
  }

  handleTabChange = (event, tabvalue) => {
    const { history } = this.props;
    this.setState({ tabvalue });
    switch (tabvalue) {
      case 0:
        history.push('/profiles');
        break;
      case 1:
        history.push('/posts');
        break;
      default:
        history.push('/');
    }
  };

  render() {
    const { message, dispatch } = this.props;
    const { classes } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <div style={{ minHeight: '48px' }}>
            <AppBar className={classes.appBar}>
              <Tabs value={this.state.tabvalue}
                onChange={this.handleTabChange}
                variant="scrollable"
                scrollButtons="on">
                <Tab label="公众号" />
                <Tab label="推送" />
              </Tabs>
              <Typography variant="h6" color="inherit" className={classes.title}>
                微信公众号可视化平台
              </Typography>
            </AppBar>
          </div>
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
