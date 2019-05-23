import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';

export default class SearchInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      q: props.value || '',
    };
  }

  render() {
    const { q } = this.state;
    const { onEnter, placeholder = '', fullWidth = false } = this.props;
    return (
      <TextField
        value={q}
        onChange={(event) => {
          this.setState({
            q: event.target.value,
          });
        }}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            onEnter(q);
          }
        }}
        placeholder={placeholder}
        fullWidth={fullWidth}
      />
    );
  }
}

SearchInput.propTypes = {
  onEnter: PropTypes.func.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  fullWidth: PropTypes.bool,
};
