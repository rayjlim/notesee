import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import MyContext from './MyContext';
import LoginForm from './components/LoginForm';
import Page from './components/Page';

import useApp from './hooks/useApp';
import './App.css';
import './ribbon.css';

const App = () => {
  const {
    isLoggedIn,
    setLoggedIn,
    loginRef,
    globalContext,
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
                    <Page />
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
                    validUser={() => setLoggedIn(true)}
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
