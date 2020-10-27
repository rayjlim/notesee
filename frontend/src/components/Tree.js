import React, { Fragment } from 'react';
import './Tree.css';

function Tree({ items, depth = 0 }) {
  if (!items || !items.length) {
    return null;
  }

  return items.map((item, idx) => {
    // if (!item.name) {
    //   return false;
    // }
    // const link = `${item.parent}${item.name}`;
    return (
        <div className="folder-container" key={item}>
          {!item.children ? (
             <Fragment>
            <span role="img" aria-label="file">📄</span>
             <a href={`/${item}`}>{`/${item}`}  {item.active ? '<---- 🔖' : ''}
            </a>
            </Fragment>
          ) : (
            <div ><span role="img" aria-label="folder">📁</span><span className="folder">{item.name}</span></div>
          )}
        </div>
    );
  });
}

export default Tree;
