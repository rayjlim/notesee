import React, { useRef, useState, Fragment } from 'react';
import Constants from '../constants';

function SearchTextForm(props) {
  const token = window.localStorage.getItem('appToken');

  const [results, setResults] = useState({});
  const [query, setQuery] = React.useState('react hooks');
  const searchInput = useRef(null);

  function handleClearSearch() {
    /* 
      .current references the input element upon mount
      useRef can store basically any value in its .current property
    */
    searchInput.current.value = '';
    setResults({});
    searchInput.current.focus();
  }
  function sendSearchText() {
    (async () => {
      console.log('send search for: ' + query);
      try {
        const response = await fetch(
          `${Constants.REST_ENDPOINT}/search?a=search&text=${query}`,
          {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
              'X-App-Token': token,
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
          }
        );

        if (response.ok) {
          const results = await response.json();

          console.log('results', results);

          setResults(results);
        } else {
          console.log('Network response was not ok.');
        }
      } catch (error) {
        console.error('Error: ' + error);
      }
    })();
  }
  function copyToClipboard(text) {
    const regex = /^(.*[\\/])/i;
    const title = text.replace(regex, '').replace('.md','').replace(/-/g,' ');

    navigator.clipboard.writeText(`[${title}](/${text})`);
  }

  return (
    <Fragment>
      Search:{' '}
      <input
        type="text"
        onChange={event => setQuery(event.target.value)}
        ref={searchInput}
      ></input>
      <button onClick={e => sendSearchText()}>Search Form</button>
      <button type="button" onClick={handleClearSearch}>
        Clear
      </button>
      {Object.keys(results).length !== 0 ? (
        <p>
          <ul>
            {Object.keys(results).map((oneKey, i) => {
              return (
                <li key={i}>
                  <button onClick={e => copyToClipboard(`${results[oneKey]}`)}>
                    [clip]
                  </button>
                  <a href={`/${results[oneKey]}`}>{`/${results[oneKey]}`}</a>
                </li>
              );
            })}
          </ul>
        </p>
      ) : (
        <Fragment>No Results</Fragment>
      )}
    </Fragment>
  );
}

export default SearchTextForm;
