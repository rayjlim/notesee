import { useRef, useState, useEffect } from 'react';
import { REST_ENDPOINT, STORAGE_KEY } from '../constants';

const useSearchTextForm = () => {
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const updatedStartDate = useRef(null);
  const updatedEndDate = useRef(null);
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

  const getByUpdateDate = () => {
    setIsLoading(true);
    (async () => {
      const urlQueryParam = `&startDate=${updatedStartDate.current.value}&endDate=${updatedEndDate.current.value}`;

      console.log('getByUpdateDate: ');
      try {
        const token = window.localStorage.getItem(STORAGE_KEY);
        const response = await fetch(
          `${REST_ENDPOINT}/search?a=getByUpdateDate${urlQueryParam}`,
          {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json',
              'X-App-Token': token,
            },
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
  };

  const setStartDate = value => {
    updatedStartDate.current.value = value;
    getByUpdateDate();
  };

  const setEndDate = value => {
    updatedEndDate.current.value = value;
    getByUpdateDate();
  };

  const changeUpdatedRange = range => {
    let startParam;
    let endParam;
    const today = new Date();
    if (range === 'last month') {
      [startParam] = new Date(
        today.getFullYear() - (today.getMonth() > 0 ? 0 : 1),
        (today.getMonth() - 1 + 12) % 12,
        1,
      ).toISOString().split('T');
      [endParam] = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T');
    } else if (range === 'last 30') {
      [startParam] = new Date(new Date().setDate(today.getDate() - 30)).toISOString().split('T');
      [endParam] = new Date().toISOString().split('T');
    } else if (range === 'last week') {
      [startParam] = new Date(new Date().setDate(today.getDate() - 7)).toISOString().split('T');
      [endParam] = new Date().toISOString().split('T');
    } else if (range === 'last day') {
      [startParam] = new Date(new Date().setDate(today.getDate() - 1)).toISOString().split('T');
      [endParam] = new Date().toISOString().split('T');
    }

    updatedEndDate.current.value = endParam;
    updatedStartDate.current.value = startParam;
    getByUpdateDate();
  };

  function copyToClipboard(text) {
    const regex = /^(.*[\\/])/i;
    const title = text.replace(regex, '').replace('.md', '').replace(/-/g, ' ');

    navigator.clipboard.writeText(`[${title}](/${text})`);
  }

  useEffect(() => {
    searchInput.current.focus();
  });
  return {
    isLoading,
    searchInput,
    updatedStartDate,
    updatedEndDate,
    results,
    sendSearchText,
    changeUpdatedRange,
    handleClearSearch,
    setStartDate,
    setEndDate,
    copyToClipboard,
  };
};
export default useSearchTextForm;
