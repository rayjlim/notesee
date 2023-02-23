import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { REST_ENDPOINT, STORAGE_KEY } from '../constants';

const FavoriteBtn = ({ path, isFavorite = false }) => {
  const [isFav, setIsFav] = useState(isFavorite);
  // TODO: convert to custom hook
  const toggleFavorite = async () => {
    console.log('toggle Favorite');

    const token = window.localStorage.getItem(STORAGE_KEY);
    try {
      console.log(isFav);
      const response = await fetch(
        `${REST_ENDPOINT}/?a=favorite&favorite=${!isFav}&path=${path}`,
        {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'X-App-Token': token,
          },
          redirect: 'follow', // manual, *follow, error
          referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        },
      );

      if (response.ok) {
        setIsFav(!isFav);
        return;
      }
      throw new Error('Network response was not ok.');
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  return (
    <span style={{ margin: '0 1em' }}>
      Favorite:
      {' '}
      <button onClick={() => toggleFavorite()} type="button">
        {isFav ? 'Yes' : 'No'}
      </button>
    </span>
  );
};

export default FavoriteBtn;

FavoriteBtn.propTypes = {
  path: PropTypes.string.isRequired,
  isFavorite: PropTypes.bool,
};
FavoriteBtn.defaultProps = {
  isFavorite: false,
};
