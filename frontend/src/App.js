import React, { useState, useEffect, Fragment } from 'react';
import marked from 'marked';
import './App.css';
import MdEditor from './components/MdEditor';
import NetworkGraph from './components/NetworkGraph';
import Tree from './components/Tree';
import Constants from './constants';

// import {Controlled as CodeMirror} from 'react-codemirror2'

const BREADCRUMB_MAX = 10;

function App() {
  const [documentInfo, setDocInfo] = useState({
    path: '',
    markdown: '',
    tree: [],
  });

  const [isLoggedIn, setLoggedIn] = useState(false);

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const [mode, setMode] = useState('read');
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [visual, setVisual] = useState({
    loading: true,
    showCreateButton: false,
    showBreadcrumb: false,
    showTree: false,
  });

  const checkLogin = async function (formUser = '', formPass = '') {
    const prefix = Constants.REST_ENDPOINT;
    const formData = new URLSearchParams();

    formData.append('username', formUser);
    formData.append('password', formPass);
    formData.append('login', true);

    try {
      const response = await fetch(prefix + '/inbox.md', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        body: formData,
      });

      if (response.ok) {
        const results = await response.json();

        console.log(results);
        // TODO: set the cookie with the token

        window.localStorage.setItem('appToken', results.token);
        setLoggedIn(true);
        return results.token;
      } else {
        console.log('Network response was not ok.');
      }
    } catch (error) {
      console.log('Error when parsing means not logged in, ' + error);
    }
  };

  const doLogin = async function () {
    console.log(user);
    console.log(password);
    const token = await checkLogin(user, password);
    setUser('');
    setPassword('');
    console.log(token);
    await load(token);
  };

  const doLogout = () => {
    window.localStorage.setItem('appToken', null);
    setLoggedIn(false);
  };

  const switchMode = () => {
    const newMode = mode === 'edit' ? 'read' : 'edit';
    console.log('switchMode', newMode);
    window.localStorage.setItem('mode', newMode);
    setMode(newMode);
  };

  const updateMarkdown = content => {
    setDocInfo({ ...documentInfo, mardown: content });
  };

  const createPage = async () => {
    let pathname = window.location.pathname;
    console.log('create page');
    const prefix = Constants.REST_ENDPOINT;
    const token = window.localStorage.getItem('appToken');
    try {
      const response = await fetch(`${prefix}${pathname}?a=create`, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          'x-app-token': token,
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      });

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
      console.error('Error: ' + error);
    }
  };

  const load = async function (token, _breadcrumb = []) {
    console.log('load');
    let pathname = window.location.pathname;
    console.log(pathname);
    const prefix = Constants.REST_ENDPOINT;
    if (pathname === '/') {
      pathname = '/index.md';
    }
    // else if /__network_map__/ then draw vis

    // breadcrumb

    let newbreadcrumb;
    console.log('breadcrumb-precheck', _breadcrumb);
    if (
      _breadcrumb.length &&
      _breadcrumb[_breadcrumb.length - 1] === pathname
    ) {
      console.log('breadcrumb: same', _breadcrumb);
    } else if (
      _breadcrumb.length > 1 &&
      _breadcrumb[_breadcrumb.length - 2] === pathname
    ) {
      console.log('breadcrumb: went to parent', _breadcrumb);
      newbreadcrumb = _breadcrumb.slice(0, _breadcrumb.length - 1);
      window.localStorage.setItem('breadcrumb', JSON.stringify(newbreadcrumb));

      setBreadcrumb(newbreadcrumb);
    } else {
      console.log('add current', pathname);
      if (_breadcrumb.length > BREADCRUMB_MAX) {
        _breadcrumb = _breadcrumb.slice(1, _breadcrumb.length - 1);
      }
      newbreadcrumb = [..._breadcrumb, pathname];
      window.localStorage.setItem('breadcrumb', JSON.stringify(newbreadcrumb));
      setBreadcrumb(newbreadcrumb);
    }
    console.log('breacdrumb-postcheck', newbreadcrumb);

    try {
      // handle history

      const response = await fetch(prefix + pathname, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-app-token': token,
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
      });

      if (response.ok) {
        console.log('load response ok');
        document.title = `Notesee - ${pathname.substring(
          1,
          pathname.length - 3
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

        setDocInfo({
          ...documentInfo,
          backlinks: results.backlinks,
          tree: results.tree,
          markdown: results.source,
          path: pathname.substring(1),
        });
        setVisual({...visual, loading: false,  showCreateButton})

      } else {
        console.log('Network response was not ok.');
      }
    } catch (error) {
      console.error('Error: ' + error);
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

  let output = '';
  try {
    output = marked(documentInfo.markdown);
  } catch (err) {
    console.log(err);
  }

  useEffect(() => {
    (async () => {
      const _mode = window.localStorage.getItem('mode');
      if (_mode) {
        console.log('_mode', _mode);
        setMode(_mode);
      }

      const _breadcrumbStr = window.localStorage.getItem('breadcrumb');
      console.log(_breadcrumbStr);
      let _breadcrumb;
      if (_breadcrumbStr) {
        console.log('has breadcrumb', _breadcrumb);
        _breadcrumb = JSON.parse(_breadcrumbStr);
        if (Array.isArray(_breadcrumb) && _breadcrumb.length) {
          setBreadcrumb(_breadcrumb);
        }
      }

      const token = window.localStorage.getItem('appToken');
      if (token && token !== '') {
        console.log('logged in:', token);

        setLoggedIn(true);
        await load(token, _breadcrumb);
      }
    })();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="App">
      {isLoggedIn ? (
        <Fragment>
          {visual.loading ? (
            <span>Loading</span>
          ) : (
            <Fragment>
              <div>
                Breadcrumb{' '}
                <button
                  onClick={e =>
                    setVisual({
                      ...visual,
                      showBreadcrumb: !visual.showBreadcrumb,
                    })
                  }
                >
                  Toggle Show Breadcrumb
                </button>
                <ul>
                  {visual.showBreadcrumb &&
                    breadcrumb &&
                    breadcrumb.map(item => (
                      <li key={item + Math.random()}>
                        <a href={item}>{item}</a>
                      </li>
                    ))}
                </ul>
              </div>
              <div>
                Backlinks{' '}
                <ul>
                  {documentInfo.backlinks &&
                    documentInfo.backlinks.map(item => (
                      <li key={item + Math.random()}>
                        <a href={`/${item}`}>{item}</a>
                      </li>
                    ))}
                </ul>
              </div>
              {visual.showCreateButton ? (
                <Fragment>
                  <button onClick={e => createPage()}>
                    Create {documentInfo.path}
                  </button>
                </Fragment>
              ) : (
                <Fragment />
              )}

              <button onClick={e => switchMode()}>Switch Mode</button>
              {mode === 'edit' ? (
                <Fragment>
                  Editor Mode
                  {/* <CodeMirror
  value={markdown}
  options={{
    mode: 'markdown',
    lineNumbers: true,
    theme: "default",
    extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"},

    scrollbarStyle: null,
    lineWrapping: true,
  }}
  onBeforeChange={(editor, data, value) => {
    console.log(editor, data, value);
  }}
  onUpdate={(editor, data, value) => {
    console.log('cm change', value)
    // setMarkdown(value);
  }}
/> */}
                  <MdEditor
                    content={documentInfo.markdown}
                    path={documentInfo.path}
                    onSave={updateMarkdown}
                  />
                </Fragment>
              ) : (
                <Fragment>
                  Read Mode
                  <div
                    style={{ textAlign: 'left', padding: '.5em' }}
                    dangerouslySetInnerHTML={{ __html: output }}
                  />
                </Fragment>
              )}

              <button
                onClick={e =>
                  setVisual({ ...visual, showTree: !visual.showTree })
                }
              >
                Toggle Show Tree
              </button>
              {visual.showTree && documentInfo.tree.length > 1 ? (
                <div style={{ textAlign: 'left' }}>
                  <Tree items={documentInfo.tree} />
                </div>
              ) : (
                <div>Tree - Hidden</div>
              )}
              <NetworkGraph nodes={documentInfo.tree} />
            </Fragment>
          )}
          <button onClick={e => doLogout()}>Logout</button>
        </Fragment>
      ) : (
        <Fragment>
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
          <button onClick={e => doLogin()}>Login</button>
        </Fragment>
      )}
    </div>
  );
}

export default App;
