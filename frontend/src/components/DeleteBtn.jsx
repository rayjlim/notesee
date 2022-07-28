import React from 'react';
import PropTypes from 'prop-types';
import Constants from '../constants';

const DeleteBtn = ({ path }) => {
  const token = window.localStorage.getItem('appToken');

  function sendDelete() {
    (async () => {
      console.log('delete path: ', path);
      try {
        const response = await fetch(
          `${Constants.REST_ENDPOINT}/search?a=delete&path=${path}`,
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
          alert(`Deleted ${path}`);
        } else {
          console.log('Network response was not ok.');
        }
      } catch (error) {
        console.error(`Error: ${error}`);
      }
    })();
  }

  return (
    <button onClick={() => sendDelete(path)} type="button">
      Delete
      {' '}
      {path}
    </button>
  );
};

export default DeleteBtn;

DeleteBtn.propTypes = {
  path: PropTypes.string.isRequired,
};
