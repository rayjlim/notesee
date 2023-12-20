import {
  useState,
  useRef,
  useEffect,
} from 'react';
import { STORAGE_KEY, REST_ENDPOINT } from '../constants';

const useApp = () => {
  const loginRef = useRef(null);
  const [globalContext, setGlobalContext] = useState(null);
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
        headers: {
          'Content-Type': 'application/json',
          'X-App-Token': token,
        },
        redirect: 'follow',
      });

      if (response.ok) {
        document.title = `Notesee - ${pathname.substring(
          1,
          pathname.length,
        )}`;
        const results = await response.json();
        const showCreateButton = results.source === '';
        if (showCreateButton) {
          // content is blank means new page content
          const title = pathname
            .substring(1, pathname.length)
            .replace(/-/g, ' ')
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.substring(1))
            .join(' ');
          results.source = `# ${title}`;
        }
        setDocumentInfo({
          markdown: results.source,
          isFavorite: results.isFavorite,
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
        await load();
      }
    })();
    // eslint-disable-next-line
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
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
  };
};
export default useApp;
