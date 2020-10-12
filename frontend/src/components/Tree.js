import React, { Fragment } from 'react';
import './Tree.css';

function Tree({ items, depth = 0 }) {
  if (!items || !items.length) {
    return null;
  }

  return items.map(item => {
    // if (!item.name) {
    //   return false;
    // }
    // const link = `${item.parent}${item.name}`;
    return (
      <Fragment key={item.name}>
        {/* Multiply the depth by a constant to create consistent spacing */}
        <div className="folder-container">
          {!item.children ? (
             <Fragment><span role="img" aria-label="file">📄</span>
             <a href={`/${item}`}>{`/${item}`}             {item.active ? '<---- 🔖' : ''}
            </a>
            </Fragment>
          ) : (
            <div ><span role="img" aria-label="folder">📁</span><span className="folder">{item.name}</span></div>
          )}
        
        <Tree items={item.children} depth={depth + 1} />
        </div>
      </Fragment>
    );
  });
}

export default Tree;
