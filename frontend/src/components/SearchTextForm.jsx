import React, { useRef, useState } from 'react';
import constants from '../constants';

const SearchTextForm = () => {
  const [results, setResults] = useState({});
  const [query, setQuery] = useState('react hooks');
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
      console.log('send search for: ', query);
      try {
        const token = window.localStorage.getItem(constants.STORAGE_KEY);
        const response = await fetch(
          `${constants.REST_ENDPOINT}/search?a=search&text=${query}`,
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
          },
        );

        if (response.ok) {
          const fetchResults = await response.json();

          console.log('results', fetchResults);

          setResults(fetchResults);
        } else {
          console.log('Network response was not ok.');
        }
      } catch (error) {
        console.error('Error: ', error);
      }
    })();
  }
  function copyToClipboard(text) {
    const regex = /^(.*[\\/])/i;
    const title = text.replace(regex, '').replace('.md', '').replace(/-/g, ' ');

    navigator.clipboard.writeText(`[${title}](/${text})`);
  }

  return (
    <>
      Search:
      {' '}
      <input
        type="text"
        onChange={event => setQuery(event.target.value)}
        ref={searchInput}
      />
      <button onClick={() => sendSearchText()} type="button">Search Form</button>
      <button type="button" onClick={handleClearSearch}>
        Clear
      </button>
      {Object.keys(results).length !== 0 ? (
        <p>
          <ul>
            {Object.keys(results).map(oneKey => (
              <li key={oneKey}>
                <button onClick={() => copyToClipboard(`${results[oneKey]}`)} type="button">
                  [clip]
                </button>
                <a href={`/${results[oneKey]}`}>{`/${results[oneKey]}`}</a>
              </li>
            ))}
          </ul>
        </p>
      ) : (
        <>No Results</>
      )}
    </>
  );
};

export default SearchTextForm;
