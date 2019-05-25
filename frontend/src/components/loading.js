import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  container: {
    position: 'fixed',
    top: '50%',
    left: '50%',
  },
  refresh: {
    display: 'inline-block',
    position: 'relative',
  },
};

class Loading extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <CircularProgress
          size={50}
          left={-25}
          top={-25}
          status="loading"
          className={classes.refresh}
        />
      </div>
    );
  }
}

export default withStyles(styles)(Loading);
