import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import MdEditor from './components/MdEditor';
import SlideDrawer from './components/SlideDrawer';
import Backdrop from './components/Backdrop';
import LoginForm from './components/LoginForm';

import { STORAGE_KEY, REST_ENDPOINT } from './constants';
import './ribbon.css';

const BREADCRUMB_MAX = 10;

const App = () => {
  const ref = useRef();
  const [markdown, setMarkdown] = useState('');
  const [isFavorite, setFavorite] = useState(false);
  const [modifiedDate, setModifiedDate] = useState(null);

  const [path, setPath] = useState('');
  const [backlinks, setBacklinks] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [isLoggedIn, setLoggedIn] = useState(false);

  const [mode, setMode] = useState('read');
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [visual, setVisual] = useState({
    loading: true,
    showCreateButton: false,
    showBreadcrumb: false,
  });
  const [showSideBar, setShowSideBar] = useState(false);

  const load = async (_breadcrumb = []) => {
    let { pathname } = window.location;
    console.log('load ', pathname);

    if (pathname === '/') {
      pathname = '/index.md';
    }
    // else if /__network_map__/ then draw vis

    // breadcrumb

    let newbreadcrumb;
    console.log('breadcrumb-precheck', _breadcrumb);
    if (
      _breadcrumb.length
      && _breadcrumb[_breadcrumb.length - 1] === pathname
    ) {
      console.log('breadcrumb: same', _breadcrumb);
    } else if (
      _breadcrumb.length > 1
      && _breadcrumb[_breadcrumb.length - 2] === pathname
    ) {
      console.log('breadcrumb: went to parent', _breadcrumb);
      newbreadcrumb = _breadcrumb.slice(0, _breadcrumb.length - 1);
      window.localStorage.setItem('breadcrumb', JSON.stringify(newbreadcrumb));

      setBreadcrumb(newbreadcrumb);
    } else {
      console.log('add current', pathname);
      if (_breadcrumb.length > BREADCRUMB_MAX) {
        // eslint-disable-next-line no-param-reassign
        _breadcrumb = _breadcrumb.slice(1, _breadcrumb.length - 1);
      }
      newbreadcrumb = [..._breadcrumb, pathname];
      window.localStorage.setItem('breadcrumb', JSON.stringify(newbreadcrumb));
      setBreadcrumb(newbreadcrumb);
    }
    console.log('breacdrumb-postcheck', newbreadcrumb);

    // TODO: convert to custom hook
    try {
      // handle history
      const token = window.localStorage.getItem(STORAGE_KEY);
      const response = await fetch(`${REST_ENDPOINT}${pathname}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Token': token,
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
      });

      if (response.ok) {
        document.title = `Notesee - ${pathname.substring(
          1,
          pathname.length - 3,
        )}`;
        const results = await response.json();
        let showCreateButton = false;
        if (results.source === '') {
          setVisual({ ...visual, showCreateButton: true });
          const title = pathname
            .substring(1, pathname.length - 3)
            .replace(/-/g, ' ')
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.substring(1))
            .join(' ');
          results.source = `# ${title}`;
          showCreateButton = true;
        }

        setMarkdown(results.source);
        setFavorite(results.isFavorite);
        setModifiedDate(results.modifiedDate);
        setPath(pathname.substring(1));
        setBacklinks(results.backlinks);
        setVisual({ ...visual, loading: false, showCreateButton });
      } else {
        console.log('Network response was not ok.');
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const createPage = async () => {
    const { pathname } = window.location;
    console.log('create page');

    const token = window.localStorage.getItem(STORAGE_KEY);
    try {
      const response = await fetch(
        `${REST_ENDPOINT}${pathname}?a=create`,
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
        if (results.status === 'success') {
          setVisual({ ...visual, showCreateButton: false });
          return;
        }
        throw new Error('Server Error on create');
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const getFavorites = async () => {
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
  };

  const toggleFavorite = async () => {
    console.log('toggle Favorite');

    const token = window.localStorage.getItem(STORAGE_KEY);
    try {
      console.log(isFavorite);
      const response = await fetch(
        `${REST_ENDPOINT}/?a=favorite&favorite=${!isFavorite}&path=${path}`,
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
        setFavorite(!isFavorite);
        return;
      }
      throw new Error('Network response was not ok.');
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const switchMode = () => {
    const newMode = mode === 'edit' ? 'read' : 'edit';
    console.log('switchMode', mode, ' to ', newMode);
    window.localStorage.setItem('mode', newMode);
    setMode(newMode);
  };

  const handleKeyDown = e => {
    if (e.altKey && e.which === 66) {
      console.log(`B keybinding - Side bar ${showSideBar}`);
      document.getElementById('sideBarBtn').click();
    } else if (e.altKey && e.which === 77) {
      console.log('M keybinding');
      switchMode();
    } else if (e.altKey && e.shiftKey && e.which === 70) {
      // F will toggle favorite
      console.log('shift F keybinding');
    }
  };

  useEffect(() => {
    (async () => {
      const localMode = window.localStorage.getItem('mode');
      if (localMode) {
        console.log('localMode', localMode);
        setMode(localMode);
      }

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

      const token = window.localStorage.getItem(STORAGE_KEY);
      if (token) {
        setLoggedIn(true);
        await load(localBreadcrumb);
        await getFavorites();
      }
    })();
    // eslint-disable-next-line
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const documentInfo = {
    markdown,
    path,
    backlinks,
  };

  const divStyle = {
    width: '50%',
    display: 'inline-block',
  };

  return (
    <div className="App">
      {isLoggedIn && (
        <>
          {visual.loading ? (
            <span>Loading</span>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                {showSideBar && (
                  <>
                    <SlideDrawer
                      show={showSideBar}
                      documentInfo={documentInfo}
                    />
                    <Backdrop
                      close={
                      () => setShowSideBar(!showSideBar)
                      }
                    />
                  </>
                )}
                <button
                  id="sideBarBtn"
                  onClick={() => { setShowSideBar(!showSideBar); }}
                  title="Alt/Opt + B"
                  type="button"
                  style={{ margin: '0 1rem' }}
                >
                  Side Bar
                </button>
                {' '}
                <span>
                  Modified Date:
                  {' '}
                  {modifiedDate}
                </span>
                {visual.showCreateButton && (
                  <button onClick={() => createPage()} className="create-btn" type="button">
                    Create
                    {' '}
                    {path}
                  </button>
                )}
                <span style={{ margin: '0 1em' }}>
                  Favorite:
                  {' '}
                  <button onClick={() => toggleFavorite()} type="button">
                    {isFavorite ? 'Yes' : 'No'}
                  </button>
                </span>
                <span>
                  Switch Mode:
                  {' '}
                  <button onClick={() => switchMode()} title="Alt/Opt + M" type="button">
                    {mode === 'edit' ? 'Editor' : 'Read'}
                  </button>
                </span>
              </div>
              <MdEditor
                content={markdown}
                path={path}
                onSave={setMarkdown}
                mode={mode}
              />
            </>
          )}

          <div style={divStyle}>
            <h2>Backlinks</h2>
            <ul>
              {documentInfo.backlinks
                && documentInfo.backlinks.map(item => (
                  <li key={item + Math.random()}>
                    <a href={`/${item}`}>{item}</a>
                  </li>
                ))}
            </ul>
          </div>
          <div style={divStyle}>
            <h2>Favorites</h2>
            <ul>
              {favorites
                && favorites.map(item => (
                  <li key={item + Math.random()}>
                    <a href={`/${item}`}>{item}</a>
                  </li>
                ))}
            </ul>
          </div>
          <div className="breadcrumb" style={divStyle}>
            <button
              onClick={() => setVisual({
                ...visual,
                showBreadcrumb: !visual.showBreadcrumb,
              })}
              type="button"
            >
              {visual.showBreadcrumb ? (
                <>Hide</>
              ) : (
                <>Show</>
              )}
              {' '}
              Breadcrumb
            </button>
            <ul className="breadcrumb">
              {visual.showBreadcrumb
                && breadcrumb
                && breadcrumb.map(item => (
                  <li key={item + Math.random()}>
                    <a href={item}>{item}</a>
                  </li>
                ))}
            </ul>
          </div>
          <div className="childDiv">
            <button
              onClick={() => {
                setLoggedIn(false);
                ref.current.logout();
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        </>
      )}
      <LoginForm
        ref={ref}
        showForm={!isLoggedIn}
        validUser={async () => {
          setLoggedIn(true);
          await load([]);
          await getFavorites();
        }}
      />
    </div>
  );
};

export default App;
