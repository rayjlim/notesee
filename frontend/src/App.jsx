import React, { useState, useRef, useEffect } from 'react';
import MdEditor from './components/MdEditor';
import SlideDrawer from './components/SlideDrawer';
import Backdrop from './components/Backdrop';
import LoginForm from './components/LoginForm';
import FavoriteBtn from './components/FavoriteBtn';
import FavoritesList from './components/FavoritesList';
import BreadcrumbList from './components/BreadcrumbList';

import { STORAGE_KEY, REST_ENDPOINT } from './constants';
import './App.css';
import './ribbon.css';

const App = () => {
  const ref = useRef();

  const [documentInfo, setDocumentInfo] = useState({ path: '' });
  const [isLoggedIn, setLoggedIn] = useState(false);

  const [mode, setMode] = useState('read');
  const [visual, setVisual] = useState({
    loading: true,
    showCreateButton: false,
  });
  const [showSideBar, setShowSideBar] = useState(false);

  const load = async () => {
    let { pathname } = window.location;
    console.log('load ', pathname);

    if (pathname === '/') {
      pathname = '/index.md';
    }

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
        const showCreateButton = results.source === '';
        if (showCreateButton) {
          // content is blank means new page content
          const title = pathname
            .substring(1, pathname.length - 3)
            .replace(/-/g, ' ')
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.substring(1))
            .join(' ');
          results.source = `# ${title}`;
        }
        setDocumentInfo({
          markdown: results.source,
          favorite: results.isFavorite,
          modifiedDate: results.modifiedDate,
          path: pathname.substring(1),
          backlinks: results.backlinks,
        });
        // TODO: auto call create page if showCreateButton is true
        setVisual({ ...visual, loading: false, showCreateButton });
        return;
      }
      throw new Error(`response was not ok. ${response?.status}`);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const createPage = async () => {
    let { pathname } = window.location;
    if (pathname === '/') {
      pathname = '/index.md';
    }
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
        throw new Error(`createPage resulted in . ${results?.message}`);
      }
      throw new Error(`createPage was not ok. ${response?.status}`);
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
      const token = window.localStorage.getItem(STORAGE_KEY);
      if (token) {
        setLoggedIn(true);
        await load();
      }
    })();
    // eslint-disable-next-line
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
                  {documentInfo.modifiedDate}
                </span>
                {visual.showCreateButton && (
                  <button onClick={() => createPage()} className="create-btn" type="button">
                    Create
                    {' '}
                    {documentInfo.path}
                  </button>
                )}
                <FavoriteBtn path={documentInfo.path} isFavorite={documentInfo.isFavorite} />
                <span>
                  Switch Mode:
                  {' '}
                  <button onClick={() => switchMode()} title="Alt/Opt + M" type="button">
                    {mode === 'edit' ? 'Editor' : 'Read'}
                  </button>
                </span>
              </div>
              <MdEditor
                content={documentInfo.markdown}
                path={documentInfo.path}
                onSave={markdown => setDocumentInfo({ ...documentInfo, markdown })}
                mode={mode}
              />
            </>
          )}

          <div className="half-row backlinks">
            <h2>Backlinks</h2>
            <ul>
              {documentInfo.backlinks
                && documentInfo.backlinks.map(item => (
                  <li key={item}>
                    <a href={`/${item}`}>{item}</a>
                  </li>
                ))}
            </ul>
          </div>
          <div className="half-row favorites-list">
            <FavoritesList />
          </div>
          <BreadcrumbList />
          <div className="logout-btn">
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
        }}
      />
    </div>
  );
};

export default App;
