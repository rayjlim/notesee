import React, { useState, useEffect } from 'react';
import { STORAGE_KEY, REST_ENDPOINT } from '../constants';

const FavoritesList = () => {
  const [favorites, setFavorites] = useState([]);

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
  }, []);

  return (
    <div className="half-row favorites-list">
      <h2>Favorites</h2>
      <ul>
        {favorites.map(item => (
          <li key={item}>
            <a href={`/${item}`}>{item}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FavoritesList;
