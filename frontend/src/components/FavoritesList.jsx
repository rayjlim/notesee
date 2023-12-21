import React from 'react';
import PropTypes from 'prop-types';
import useFavorites from '../hooks/useFavorites';

const FavoritesList = ({ path }) => {
  const { favorites, toggleFavorite } = useFavorites(path);

  const isFav = favorites.includes(path);
  return (
    <div className="half-row favorites-list">
      <h2>Favorites</h2>
      <span style={{ margin: '0 1em' }}>
        {'Favorite: '}
        <button onClick={() => toggleFavorite(isFav)} type="button">
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
};
