import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { STORAGE_KEY, REST_ENDPOINT } from '../constants';

const FavoritesList = ({ path, isFavorite = false }) => {
  const [favorites, setFavorites] = useState([]);
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

  useEffect(async () => {
    const token = window.localStorage.getItem(STORAGE_KEY);
    try {
      const response = await fetch(
        `${REST_ENDPOINT}/?a=getFavorites`,
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
        const results = await response.json();
        setFavorites(results.paths);
        return;
      }
      throw new Error('Network response was not ok.');
    } catch (error) {
      console.error('Error: ', error);
    }
  }, [isFav]);

  return (
    <div className="half-row favorites-list">
      <h2>Favorites</h2>
      <span style={{ margin: '0 1em' }}>
        Favorite:
        {' '}
        <button onClick={() => toggleFavorite()} type="button">
          {isFav ? 'Yes' : 'No'}
        </button>
      </span>
      <ol>
        {favorites.map(item => (
          <li key={item}>
            <a href={`/${item}`}>{item}</a>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default FavoritesList;

FavoritesList.propTypes = {
  path: PropTypes.string.isRequired,
  isFavorite: PropTypes.bool,
};
FavoritesList.defaultProps = {
  isFavorite: false,
};
