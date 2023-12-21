import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEY, REST_ENDPOINT } from '../constants';

const useFavorites = path => {
  const [favorites, setFavorites] = useState([]);
  const faves = useRef(null);
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

  const handleKeyDown = e => {
    if (e.altKey) {
      console.log(faves.current);
      if (e.key === '1') {
        console.log(`Alt 1 B keybinding ${e.key}`);
        window.location = `/${faves.current[0]}`;
      } else if (e.key === '2') {
        console.log(`Alt 2 B keybinding ${e.key}`);
        window.location = `/${faves.current[1]}`;
      } else if (e.key === '3') {
        console.log(`Alt 2 B keybinding ${e.key}`);
        window.location = `/${faves.current[2]}`;
      } else if (e.key === '4') {
        console.log(`Alt 2 B keybinding ${e.key}`);
        window.location = `/${faves.current[3]}`;
      } else if (e.key === '5') {
        console.log(`Alt 2 B keybinding ${e.key}`);
        window.location = `/${faves.current[4]}`;
      } else if (e.key === '6') {
        console.log(`Alt 2 B keybinding ${e.key}`);
        window.location = `/${faves.current[5]}`;
      } else if (e.key === '7') {
        console.log(`Alt 2 B keybinding ${e.key}`);
        window.location = `/${faves.current[6]}`;
      } else if (e.key === '8') {
        console.log(`Alt 2 B keybinding ${e.key}`);
        window.location = `/${faves.current[7]}`;
      } else if (e.key === '9') {
        console.log(`Alt 2 B keybinding ${e.key}`);
        window.location = `/${faves.current[8]}`;
      }
    }
  };

  useEffect(() => {
    (async () => {
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
          faves.current = results.paths;
          return;
        }
        throw new Error('Network response was not ok.');
      } catch (error) {
        console.error('Error: ', error);
      }
    })();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { favorites, toggleFavorite };
};
export default useFavorites;
