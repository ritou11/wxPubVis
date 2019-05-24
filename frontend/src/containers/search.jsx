import React from 'react';
import { assembleUrl } from '../actions';
import SearchInput from '../components/searchInput.jsx';

class Search extends React.Component {
  render() {
    const { location, history, searchArgs, defaultText } = this.props;
    const { pathname } = location;
    let { q = '' } = searchArgs;
    q = decodeURIComponent(q);
    const nextQuery = { ...searchArgs };

    // 去掉分页query
    if (nextQuery.page) delete nextQuery.page;
    return (
      <div style={{
        padding: '0px 5px 10px 5px',
      }}>
        <SearchInput
          value={q}
          placeholder={defaultText}
          fullWidth={true}
          onEnter={(qr) => {
            if (qr) nextQuery.q = qr;
            if (!qr && nextQuery.q) delete nextQuery.q;
            const path = assembleUrl(pathname, nextQuery);
            history.push(path);
          }}
        />
      </div>
    );
  }
}

export default Search;
