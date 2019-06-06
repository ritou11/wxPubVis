import React from 'react';
import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import red from '@material-ui/core/colors/red';

import VisWordcloud from './visWordcloud';

const styles = (theme) => ({
  card: {
    minWidth: 350,
    maxWidth: 350,
    margin: '0px 10px',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: red[500],
  },
});

class PostCard extends React.Component {
  constructor() {
    super();
    this.state = {
      expanded: false,
    };
  }

  handleExpandClick = () => {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const { classes, data } = this.props;
    return (
      <Card className={classes.card}>
        <CardHeader
          title={data.post.title}
          subheader={data.post.publishAt ? moment(data.post.publishAt).format('YY-MM-DD HH:mm') : '暂无'}
        />
        <CardContent>
          <VisWordcloud data={data.postThemes} settings={{
            width: 200,
            height: 200,
          }}/>
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(PostCard);
