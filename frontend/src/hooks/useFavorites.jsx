import { useState, useEffect } from 'react';
import { STORAGE_KEY, REST_ENDPOINT } from '../constants';

const useFavorites = path => {
  const [favorites, setFavorites] = useState([]);
  const toggleFavorite = async isFav => {
    console.log('toggle Favorite');

    const token = window.localStorage.getItem(STORAGE_KEY);
    try {
      const response = await fetch(
        `${REST_ENDPOINT}/?a=favorite&favorite=${!isFav}&path=${path}`,
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
        if (!isFav) {
          const newFaves = [...favorites, path];
          setFavorites(newFaves.sort());
        } else {
          setFavorites(favorites.filter(localPath => localPath !== path));
        }
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
          headers: {
            'Content-Type': 'application/json',
            'X-App-Token': token,
          },
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

  return { favorites, toggleFavorite };
};
export default useFavorites;
