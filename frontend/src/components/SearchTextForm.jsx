import React, { useRef, useState, useEffect } from 'react';
import { REST_ENDPOINT, STORAGE_KEY } from '../constants';
import './SearchTextForm.css';

const SearchTextForm = () => {
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
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
  const sendSearchText = () => {
    setIsLoading(true);
    (async () => {
      console.log('send search for: ', searchInput.current.value);
      const queryText = searchInput.current.value.replace('#', '%23');
      try {
        const token = window.localStorage.getItem(STORAGE_KEY);
        const response = await fetch(
          `${REST_ENDPOINT}/search?a=search&text=${queryText}`,
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
          setIsLoading(false);
        } else {
          console.log('Network response was not ok.');
        }
      } catch (error) {
        console.error('Error: ', error);
      }
    })();
  };
  const getByUpdateDate = range => {
    setIsLoading(true);
    (async () => {
      let term = range;
      if (term === 'last month') {
        const now = new Date();
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        const startDate = new Date(
          now.getFullYear() - (now.getMonth() > 0 ? 0 : 1),
          (now.getMonth() - 1 + 12) % 12,
          1,
        ).toISOString().split('T')[0];

        term = `&startDate=${startDate}&endDate=${endDate}`;
      } else if (term === 'last 30') {
        const today = new Date();
        const startDate = new Date(new Date().setDate(today.getDate() - 30)).toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];
        term = `&startDate=${startDate}&endDate=${endDate}`;
      } else if (term === 'last day') {
        const today = new Date();
        const startDate = new Date(new Date().setDate(today.getDate() - 1)).toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];
        term = `&startDate=${startDate}&endDate=${endDate}`;
      }

      console.log('getByUpdateDate: ');
      try {
        const token = window.localStorage.getItem(STORAGE_KEY);
        const response = await fetch(
          `${REST_ENDPOINT}/search?a=getByUpdateDate${term}`,
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

          setResults(fetchResults.paths.map(x => x.path));
          setIsLoading(false);
        } else {
          console.log('Network response was not ok.');
        }
      } catch (error) {
        console.error('Error: ', error);
      }
    })();
    return false;
  };

  function copyToClipboard(text) {
    const regex = /^(.*[\\/])/i;
    const title = text.replace(regex, '').replace('.md', '').replace(/-/g, ' ');

    navigator.clipboard.writeText(`[${title}](/${text})`);
  }

  useEffect(() => {
    searchInput.current.focus();
  });

  return (
    <>
      {'Search: '}
      <input
        type="text"
        ref={searchInput}
      />
      <button onClick={() => sendSearchText()} type="button">Search Form</button>
      <button type="button" onClick={handleClearSearch}>
        Clear
      </button>
      <p style={{ margin: 0 }}>
        <span>Last Updated : </span>
        <a href="#blank" onClick={() => getByUpdateDate('last day')}> 1 Day</a>
        <a href="#blank" onClick={() => getByUpdateDate('')}> 1 Week</a>
        <a href="#blank" onClick={() => getByUpdateDate('last 30')}> 30 days</a>
        <a href="#blank" onClick={() => getByUpdateDate('last month')}> Prev. Month</a>
      </p>
      {isLoading && <h2>Loading...</h2>}
      {!isLoading && Object.keys(results).length !== 0 ? (
        <>
          <span style={{ padding: '0 1em' }}>
            {`Found ${Object.keys(results).length} Result(s)`}
          </span>
          <div className={Object.keys(results).length < 15 ? 'results' : 'results scroll'}>
            <ul>
              {Object.keys(results).map(index => (
                <li key={index}>
                  <button onClick={() => copyToClipboard(`${results[index]}`)} type="button" style={{ marginRight: '0.5rem' }}>
                    [clip]
                  </button>
                  <a href={`/${results[index]}`}>{`/${results[index]}`}</a>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <span style={{ padding: '0 1em' }}>No Results</span>
      )}
    </>
  );
};

export default SearchTextForm;
