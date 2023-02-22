import React, { useState, useRef, useEffect } from 'react';
// import PropTypes from 'prop-types';
// import { ToastContainer, toast } from 'react-toastify';
// import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { useGoogleLogin } from '@react-oauth/google';
import { REST_ENDPOINT, STORAGE_KEY } from '../constants';
import './LoginForm.css';

const LoginForm = () => {
  const username = useRef('');
  const password = useRef('');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const login = useGoogleLogin({
    onSuccess: codeResponse => setUser(codeResponse),
    onError: error => console.log('Login Failed:', error),
  });

  const checkLogin = async ({ formUser = '', formPass = '', id = '' }) => {
    const prefix = REST_ENDPOINT;
    const formData = {
      id,
      username: formUser,
      password: formPass,
      login: true,
    };
    try {
      const response = await fetch(`${prefix}/index.md`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const results = await response.json();
        console.log('login results', results);
        if (results.token !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, results.token);
          // setLoggedIn(true);
        }
        return true;
      }

      console.log(response);
      console.log(response.status);
      const body = await response.json();
      alert(`login failed : ${body.message} (${response.status})`);
    } catch (error) {
      console.log('Error when parsing means not logged in, ', error, prefix);
    }
    return true;
  };

  const doLogin = async id => {
    console.log('doLogin', id);
    console.log(username.current.value, password.current.value);
    const loginParam = id
      ? { id, formUser: 'n/a', formPass: 'n/a' }
      : { formUser: username.current.value, formPass: password.current.value };
    console.log('loginParam', loginParam);
    const token = await checkLogin(loginParam);
    if (!token) {
      username.current.value = '';
      password.current.value = '';
      // toast.error('Bad Login');
      alert('bad login');
    } else {
      console.log(token);
      // goto main page
    }
  };

  // const doLogout = () => {
  //   window.localStorage.removeItem(STORAGE_KEY);
  //   googleLogout();
  //   setProfile(null);
  // };

  useEffect(
    async () => {
      if (user) {
        try {
          const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`);
          const results = await response.json();
          console.log(results);
          setProfile(results);
          if (user.access_token) {
            doLogin(results.id);
          }
          // create security backend that takes an ID
          // encrypt .env files
        } catch (err) {
          console.error(err);
        }
      }
    },
    [user],
  );

  return (
    <div className="App">
      {/* <ToastContainer /> */}
      <h1>Login</h1>
      <span>User</span>
      <input type="text" ref={username} />
      <span>Password</span>
      <input type="password" ref={password} />
      <button onClick={() => doLogin(null)} type="button">
        Login with Password
      </button>
      <div>
        <h2>Google Login</h2>
        {profile?.id ? (
          <div>
            <img src={profile.picture} alt="user" />
            <h3>User Logged in</h3>
            <p>
              Name:
              {profile.name}
            </p>
            <p>
              Email Address:
              {profile.email}
            </p>
            <br />
            <br />
            {/* <button onClick={logOut} type="button">Log out</button> */}
          </div>
        ) : (
          <button onClick={() => login()} type="button">Sign in with Google</button>
        )}
      </div>
    </div>
  );
};

export default LoginForm;

// LoginForm.propTypes = {
// };
