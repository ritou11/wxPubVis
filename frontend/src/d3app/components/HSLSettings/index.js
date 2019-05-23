import * as _ from 'lodash';
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const styles = {
  root: {
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column',
  },
};

class HSLSettings extends Component {
  state = {};

  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.checked });
    const { checkedZoom, checkedTrans, checkedImg } = this.state;
    this.props.storeSettings(_.merge({
      checkedZoom,
      checkedTrans,
      checkedImg,
    }, { [name]: event.target.checked }));
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <FormLabel component="legend">{this.props.label}</FormLabel>
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                defaultChecked={false}
                onChange={this.handleChange('checkedZoom')}
                value="checkedZoom"
                color="primary"
              />
            }
            label="Zoom"
          />
          <FormControlLabel
            control={
              <Switch
                defaultChecked={false}
                onChange={this.handleChange('checkedTrans')}
                value="checkedTrans"
                color="primary"
              />
            }
            label="Transition"
          />
          <FormControlLabel
            control={
              <Switch
                defaultChecked={false}
                onChange={this.handleChange('checkedImg')}
                value="checkedImg"
                color="primary"
              />
            }
            label="Pie Image"
          />
        </FormGroup>
      </div>
    );
  }
}

export default withStyles(styles)(HSLSettings);
