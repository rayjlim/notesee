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
              'x-app-token': token,
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
