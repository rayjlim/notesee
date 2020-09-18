import React, { Fragment } from 'react';
import Constants from '../constants';
function Tree({ items, depth = 0 }) {
  if (!items || !items.length) {
    return null;
  }

  return items.map(item => {
    if (!item.name) {
      return false;
    }
    const link = `${Constants.PROJECT_ROOT}${item.parent}${item.name}`;
    return (
      <Fragment key={item.name}>
        {/* Multiply the depth by a constant to create consistent spacing */}
        <div style={{ paddingLeft: depth * 15 }}>
          {!item.children ? (
            <a href={link}>
              {item.name}
              {item.active ? '++' : ''}
            </a>
          ) : (
            <span>{item.name}</span>
          )}
        </div>
        <Tree items={item.children} depth={depth + 1} />
      </Fragment>
    );
  });
}

export default Tree;
