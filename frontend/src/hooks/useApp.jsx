import {
  useState,
  useRef,
  useEffect,
} from 'react';
import { STORAGE_KEY, REST_ENDPOINT } from '../constants';

const useApp = () => {
  const loginRef = useRef(null);
  const [globalContext, setGlobalContext] = useState(null);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      if (!globalContext) {
        try {
          const response = await fetch(
            `${REST_ENDPOINT}/notesee_settings`,
            {
              method: 'GET',
              mode: 'cors',
              credentials: 'same-origin',
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );

          if (response.ok) {
            const results = await response.json();
            setGlobalContext(results);
          }
        } catch (error) {
          console.error('Error: ', error);
        }
      }
      const token = window.localStorage.getItem(STORAGE_KEY);
      if (token) {
        setLoggedIn(true);
      }
    })();
  }, []);

  return {
    isLoggedIn,
    setLoggedIn,
    loginRef,
    globalContext,
  };
};
export default useApp;
