import React from 'react';
import ReactDOM from 'react-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App';
import { GOOGLE_CLIENTID, ENVIRONMENT } from './constants';
import * as serviceWorker from './serviceWorker';

import './index.css';

const showDevRibbon = ENVIRONMENT === 'development';

ReactDOM.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENTID}>
    <React.StrictMode>
      {showDevRibbon && <a className="github-fork-ribbon" href="#dev" data-ribbon="Development" title="Development">Development</a>}
      <App />
    </React.StrictMode>
  </GoogleOAuthProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
