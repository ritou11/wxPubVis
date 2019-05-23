import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const styles = {
  root: {
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'row',
  },
  textField: {
    flex: 1,
  },
  imageInput: {
    display: 'none',
  },
  label: {
    margin: 'auto',
  },
};

class UploadField extends Component {
  state = {
    filename: 'example.png',
  };

  readImage(path, callback) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(path);
    fileReader.onload = (e) => {
      callback(e.target.result);
    };
  }

  _handleFileChange({ target }) {
    this.readImage(target.files[0], (img) => { this.props.storeImg(img); });
    this.setState({ filename: target.files[0].name });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <TextField
          label="ImageName"
          className={classes.textField}
          value={this.state.filename}
        />
        <input
          accept="image/*"
          className={classes.imageInput}
          onChange={this._handleFileChange.bind(this)}
          id="contained-button-file"
          multiple
          type="file"
        />
        <label htmlFor="contained-button-file" className={classes.label}>
          <Button variant="contained" component="span"
            color="primary">
            Upload
          </Button>
        </label>
      </div>
    );
  }
}

export default withStyles(styles)(UploadField);
