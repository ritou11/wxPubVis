import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

const style = {
  container: {
    position: 'fixed',
    top: '50%',
    left: '50%'
  },
  refresh: {
    display: 'inline-block',
    position: 'relative'
  },
};

const Loading = () => (
  <div style={style.container}>
    <CircularProgress
      size={50}
      left={-25}
      top={-25}
      status="loading"
      style={style.refresh}
    />
  </div>
);

export default Loading;
