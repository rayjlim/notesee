import React, { Fragment } from 'react';
import Constants from '../constants';

function DeleteBtn(props) {
  const token = window.localStorage.getItem('appToken');

  function sendDelete() {
    (async () => {
      console.log('delete path: ' + props.path);
      try {
        const prefix = Constants.REST_ENDPOINT;
        const response = await fetch(
          `${prefix}/search?a=delete&path=${props.path}`,
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
          alert(`deleted ${props.path}`);
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
      <button onClick={e => sendDelete(props.path)}>Delete {props.path}</button>
    </Fragment>
  );
}

export default DeleteBtn;
