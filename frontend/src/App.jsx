import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import MyContext from './MyContext';
import MdEditor from './components/MdEditor';
import SlideDrawer from './components/SlideDrawer';
import Backdrop from './components/Backdrop';
import LoginForm from './components/LoginForm';
import FavoritesList from './components/FavoritesList';
import BreadcrumbList from './components/BreadcrumbList';
import useApp from './hooks/useApp';
import './App.css';
import './ribbon.css';

const App = () => {
  const {
    isLoggedIn,
    setLoggedIn,
    loginRef,
    documentInfo,
    setDocumentInfo,
    showSideBar,
    setShowSideBar,
    createPage,
    globalContext,
    visual,
    mode,
    switchMode,
    load,
  } = useApp();

  return (
    <>
      {globalContext !== null
        && (
          <MyContext.Provider value={globalContext}>
            <GoogleOAuthProvider clientId={globalContext.GOOGLE_OAUTH_CLIENTID}>
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
                          <span>
                            {`Modified Date: ${documentInfo.modifiedDate} `}
                          </span>
                          {visual.showCreateButton && (
                            <button onClick={() => createPage()} className="create-btn" type="button">
                              {`Create ${documentInfo.path}`}
                            </button>
                          )}
                          <span style={{ margin: '0 1rem' }}>
                            {'Switch Mode: '}
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
                        <FavoritesList
                          path={documentInfo.path}
                          isFavorite={documentInfo.isFavorite}
                        />
                      </>
                    )}
                    <BreadcrumbList />
                    <div className="logout-btn">
                      <button
                        onClick={() => {
                          setLoggedIn(false);
                          loginRef?.current.logout();
                        }}
                        type="button"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
                <div className={!isLoggedIn ? '' : 'hide'}>
                  <LoginForm
                    ref={loginRef}
                    validUser={async () => {
                      setLoggedIn(true);
                      await load([]);
                    }}
                  />
                </div>
              </div>
            </GoogleOAuthProvider>
          </MyContext.Provider>
        )}
      <span />
    </>
  );
};

export default App;
