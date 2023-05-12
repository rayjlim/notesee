import React from 'react';
import PropTypes from 'prop-types';
import './Tree.css';

const Tree = ({ items }) => {
  if (!items || !items.length) {
    return null;
  }
  return items.map(item => (
    <div className="folder-container" key={item}>
      {!item.children ? (
        <>
          <span role="img" aria-label="file">
            📄
          </span>
          <a href={`/${item.path}`}>
            {`/${item.path}`}
            {' '}
            {item.hasString === '1' ? '<---- 🔖' : ''}
          </a>
        </>
      ) : (
        <div>
          <span role="img" aria-label="folder">
            📁
          </span>
          <span className="folder">{item.name}</span>
        </div>
      )}
    </div>
  ));
};

export default Tree;

Tree.propTypes = {
  items: PropTypes.array.isRequired,
};
