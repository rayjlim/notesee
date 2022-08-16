import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import './App.css';
import MdEditor from './components/MdEditor';

import SlideDrawer from './components/SlideDrawer';
import Backdrop from './components/Backdrop';
import constants from './constants';

const BREADCRUMB_MAX = 10;

const App = () => {
  const [markdown, setMarkdown] = useState('');
  const [isFavorite, setFavorite] = useState(false);
  const [path, setPath] = useState('');
  const [backlinks, setBacklinks] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [isLoggedIn, setLoggedIn] = useState(false);

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const [mode, setMode] = useState('read');
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [visual, setVisual] = useState({
    loading: true,
    showCreateButton: false,
    showBreadcrumb: false,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = async (_breadcrumb = []) => {
    console.log('load');
    let { pathname } = window.location;
    console.log(pathname);

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
      const token = window.localStorage.getItem(constants.STORAGE_KEY);
      const response = await fetch(`${constants.REST_ENDPOINT}${pathname}`, {
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
        console.log('load response ok');
        document.title = `Notesee - ${pathname.substring(
          1,
          pathname.length - 3,
        )}`;
        const results = await response.json();

        console.log('results', results);
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
        console.log('results', results);

        setMarkdown(results.source);
        setFavorite(results.isFavorite);
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

  const checkLogin = async (formUser = '', formPass = '') => {
    const prefix = constants.REST_ENDPOINT;
    const formData = new URLSearchParams();

    formData.append('username', formUser);
    formData.append('password', formPass);
    formData.append('login', true);

    try {
      const response = await fetch(`${prefix}/index.md`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        body: formData,
      });

      if (response.ok) {
        const results = await response.json();

        console.log('login results', results);
        window.localStorage.setItem(constants.STORAGE_KEY, results.token);
        setLoggedIn(true);
        return results.token;
      }
      console.log('Network response was not ok.');
    } catch (error) {
      console.log('Error when parsing means not logged in, ', error, prefix);
    }
    return true;
  };

  const doLogin = async () => {
    const token = await checkLogin(user, password);
    setUser('');
    setPassword('');
    if (!token) {
      alert('invalid login');
      return;
    }
    console.log(token);
    await load(token);
  };

  const doLogout = () => {
    window.localStorage.setItem(constants.STORAGE_KEY, null);
    setLoggedIn(false);
  };

  const switchMode = () => {
    const newMode = mode === 'edit' ? 'read' : 'edit';
    console.log('switchMode', newMode);
    window.localStorage.setItem('mode', newMode);
    setMode(newMode);
  };

  const createPage = async () => {
    const { pathname } = window.location;
    console.log('create page');

    const token = window.localStorage.getItem(constants.STORAGE_KEY);
    try {
      const response = await fetch(
        `${constants.REST_ENDPOINT}${pathname}?a=create`,
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

        console.log(results);
        if (results.status === 'success') {
          setVisual({ ...visual, showCreateButton: false });
        } else {
          alert('Server Error on create');
        }
      } else {
        console.log('Network response was not ok.');
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const getFavorites = async () => {
    console.log('getFavorites');

    const token = window.localStorage.getItem(constants.STORAGE_KEY);
    try {
      const response = await fetch(
        `${constants.REST_ENDPOINT}/?a=getFavorites`,
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
        console.log(results);
        setFavorites(results.paths);
      } else {
        console.log('Network response was not ok.');
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const toggleFavorite = async () => {
    console.log('toggle Favorite');

    const token = window.localStorage.getItem(constants.STORAGE_KEY);
    try {
      console.log(isFavorite);
      const response = await fetch(
        `${constants.REST_ENDPOINT}/?a=favorite&favorite=${!isFavorite}&path=${path}`,
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
      } else {
        console.log('Network response was not ok.');
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    smartLists: true,
    smartypants: false,
  });
  const drawerToggleClickHandler = () => {
    setDrawerOpen(!drawerOpen);
  };
  const handleKeyDown = e => {
    if (e.altKey && e.which === 66) {
      console.log('B keybinding - Side bar');
      drawerToggleClickHandler();
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

      const token = window.localStorage.getItem(constants.STORAGE_KEY);
      if (token && token !== '') {
        console.log('logged in:', token);

        setLoggedIn(true);
        await load(localBreadcrumb);
        await getFavorites();
      }
    })();
    // eslint-disable-next-line
    document.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      {isLoggedIn ? (
        <>
          {visual.loading ? (
            <span>Loading</span>
          ) : (
            <>
              <div>
                <div className="childDiv">
                  {drawerOpen && (
                    <SlideDrawer
                      show={drawerOpen}
                      documentInfo={documentInfo}
                    />
                  )}
                  {drawerOpen && <Backdrop close={() => drawerToggleClickHandler()} />}
                  <button
                    onClick={() => drawerToggleClickHandler()}
                    title="Alt/Opt + B"
                    type="button"
                  >
                    Side Bar
                  </button>
                </div>
                <div className="childDiv">
                  <button onClick={() => doLogout()} type="button">Logout</button>
                </div>
              </div>

              {visual.showCreateButton ? (
                <button onClick={() => createPage()} className="create-btn" type="button">
                  Create
                  {' '}
                  {path}
                </button>
              ) : (
                <span> </span>
              )}
              <span>
                Favorite:
                {' '}
                {isFavorite ? 'Y' : 'N'}
                {' '}
                <button onClick={() => toggleFavorite()} type="button">
                  Toggle Favorite
                </button>
              </span>
              <button onClick={() => switchMode()} title="Alt/Opt + M" type="button">
                Switch Mode
                {mode === 'edit' ? (
                  <> : Editor</>
                ) : (
                  <>: Read</>
                )}
              </button>
              {mode === 'edit' ? (
                <MdEditor
                  content={markdown}
                  path={path}
                  onSave={setMarkdown}
                  mode={mode}
                />
              ) : (
                <MdEditor
                  content={markdown}
                  path={path}
                  onSave={setMarkdown}
                  mode={mode}
                />
              )}
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
        </>
      ) : (
        <>
          <span>User</span>
          <input
            type="text"
            value={user}
            onChange={e => setUser(e.target.value)}
          />
          <span>Password</span>
          <input
            type="text"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={() => doLogin()} type="button">Login</button>
        </>
      )}
    </div>
  );
};

export default App;
