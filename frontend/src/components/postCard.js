import React from 'react';
import clsx from 'clsx';
import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import red from '@material-ui/core/colors/red';
import Button from '@material-ui/core/Button';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import VisRelated from './visRelated';

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
          avatar={
            <Avatar aria-label={data.profile.title}
              className={classes.avatar}
              src={data.profile.headimg}
            />
          }
          action={
            <IconButton aria-label="Settings" href={data.link}>
              <MoreVertIcon />
            </IconButton>
          }
          title={data.profile.title}
          subheader={data.publishAt ? moment(data.publishAt).format('YY-MM-DD HH:mm') : '暂无'}
        />
        <CardMedia
          className={classes.media}
          image={data.cover}
          title={data.title}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {data.title}
          </Typography>
          <Typography variant="body2" color="textPrimary" component="p">
            {data.digest}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            阅读量：{data.readNum}，点赞数：{data.likeNum}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" color="primary" href={data.sourceUrl}>
            Read more
          </Button>
          <IconButton
            className={clsx(classes.expand, {
              [classes.expandOpen]: this.state.expanded,
            })}
            onClick={this.handleExpandClick}
            aria-expanded={this.state.expanded}
            aria-label="Show content"
          >
            <ExpandMoreIcon />
          </IconButton>
        </CardActions>
        <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
          <CardContent>
            {(() => {
              if (data.related) {
                return (
                  <div>
                    <Typography component="h5" variant="h5" align="center">
                      相似文章
                    </Typography>
                    <VisRelated data={data.related} settings={{
                      outerR: 100,
                    }}/>
                  </div>
                );
              }
              return (
                <Typography> 暂无相关文章！</Typography>
              );
            })()}
          </CardContent>
        </Collapse>
      </Card>
    );
  }
}

export default withStyles(styles)(PostCard);
