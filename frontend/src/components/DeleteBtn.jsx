import React from 'react';
import PropTypes from 'prop-types';
import constants from '../constants';

const DeleteBtn = ({ path }) => {
  // TODO: convert to custom hook
  const sendDelete = () => {
    (async () => {
      console.log('delete path: ', path);
      try {
        const token = window.localStorage.getItem(constants.STORAGE_KEY);
        const response = await fetch(
          `${constants.REST_ENDPOINT}/search?a=delete&path=${path}`,
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
          alert(`Deleted ${path}`);
        } else {
          console.log('Network response was not ok.');
        }
      } catch (error) {
        console.error(`Error: ${error}`);
      }
    })();
  };

  return (
    <button onClick={() => sendDelete()} type="button">
      {`Delete ${path}`}
    </button>
  );
};

export default DeleteBtn;

DeleteBtn.propTypes = {
  path: PropTypes.string.isRequired,
};
