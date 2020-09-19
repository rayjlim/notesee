import React, { Fragment } from 'react';
function Tree({ items, depth = 0 }) {
  if (!items || !items.length) {
    return null;
  }

  return items.map(item => {
    if (!item.name) {
      return false;
    }
    const link = `${item.parent}${item.name}`;
    return (
      <Fragment key={item.name}>
        {/* Multiply the depth by a constant to create consistent spacing */}
        <div style={{ paddingLeft: depth * 15 }}>
          {!item.children ? (
             <Fragment>📄
             <a href={link}>
              {item.name}
              {item.active ? '<---- 🔖' : ''}
            </a>
            </Fragment>
          ) : (
            <span>📁{item.name}</span>
          )}
        </div>
        <Tree items={item.children} depth={depth + 1} />
      </Fragment>
    );
  });
}

export default Tree;
