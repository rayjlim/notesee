import React from 'react';
import useSearchTextForm from '../hooks/useSearchTextForm';
import './SearchTextForm.css';

const SearchTextForm = () => {
  const {
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
  } = useSearchTextForm();

  return (
    <>
      {'Search: '}
      <input
        type="text"
        ref={searchInput}
      />
      <button onClick={() => sendSearchText()} type="button">Search Form</button>
      <button type="button" onClick={handleClearSearch}>Clear</button>
      <div style={{ margin: 0 }}>
        <span>Last Updated : </span>
        <a href="#blank" onClick={() => changeUpdatedRange('last day')}> 1 Day</a>
        <a href="#blank" onClick={() => changeUpdatedRange('last week')}> 1 Week</a>
        <a href="#blank" onClick={() => changeUpdatedRange('last 30')}> 30 days</a>
        <a href="#blank" onClick={() => changeUpdatedRange('last month')}> Prev. Month</a>
      </div>
      <div>
        <input type="date" ref={updatedStartDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" ref={updatedEndDate} onChange={e => setEndDate(e.target.value)} />
      </div>
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
