import React, { useState, useEffect } from 'react';

const BREADCRUMB_MAX = 10;

const BreadcrumbList = () => {
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [showBreadcrumb, setShowBreadcrumb] = useState(false);

  useEffect(async () => {
    const { pathname } = window.location;
    const localBreadcrumbStr = window.localStorage.getItem('breadcrumb');
    console.log(localBreadcrumbStr);
    let localBreadcrumb;
    if (localBreadcrumbStr) {
      console.log('has breadcrumb', localBreadcrumbStr);
      localBreadcrumb = JSON.parse(localBreadcrumbStr);
      if (Array.isArray(localBreadcrumb) && localBreadcrumb.length) {
        setBreadcrumb(localBreadcrumb);
      }
    }

    if (
      localBreadcrumb.length
      && localBreadcrumb[localBreadcrumb.length - 1] === pathname
    ) {
      console.log('localBreadcrumb: same', localBreadcrumb);
    } else if (
      localBreadcrumb.length > 1
      && localBreadcrumb[localBreadcrumb.length - 2] === pathname
    ) {
      console.log('localBreadcrumb: went to parent', localBreadcrumb);
      const newbreadcrumb = localBreadcrumb.slice(0, localBreadcrumb.length - 1);
      window.localStorage.setItem('breadcrumb', JSON.stringify(newbreadcrumb));
      setBreadcrumb(newbreadcrumb);
    } else {
      console.log('add current', pathname, localBreadcrumb);
      const newbreadcrumb = (localBreadcrumb.length > BREADCRUMB_MAX)
        ? localBreadcrumb.slice(1, localBreadcrumb.length - 1)
        : localBreadcrumb;
      console.log(newbreadcrumb);
      const newNewBreadcrumb = [...newbreadcrumb, pathname];
      console.log('writing', JSON.stringify(newNewBreadcrumb));
      window.localStorage.setItem('breadcrumb', JSON.stringify(newNewBreadcrumb));
      setBreadcrumb(newNewBreadcrumb);
    }
  }, []);

  return (
    <div className="breadcrumb half-row">
      <button
        onClick={() => setShowBreadcrumb(!showBreadcrumb)}
        type="button"
      >
        {showBreadcrumb ? (
          <>Hide</>
        ) : (
          <>Show</>
        )}
        {' '}
        Breadcrumb
      </button>
      {showBreadcrumb
        && breadcrumb
        && (
          <ul className="breadcrumb">
            {
            breadcrumb.map(item => (
              <li key={item + Math.random()}>
                <a href={item}>{item}</a>
              </li>
            ))
          }
          </ul>
        )}
    </div>
  );
};

export default BreadcrumbList;
