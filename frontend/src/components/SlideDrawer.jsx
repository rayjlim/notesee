// # SlideDrawer.js
import React, { useEffect, useState } from 'react';
import './SlideDrawer.css';
import pkg from '../../package.json';
import Constants from '../constants';
import SearchTextForm from './SearchTextForm';
import Tree from './Tree';
import NetworkGraph from './NetworkGraph';
import DeleteBtn from './DeleteBtn';
import UploadForm from './UploadForm.jsx';

function SlideDrawer(props) {
  const [showTree, toggleShowTree] = useState(false);
  const [showGraph, toggleShowGraph] = useState(false);

  const [tree, setTree] = useState([]);

  useEffect(() => {
    if ((showTree || showGraph) && !tree.length) {
      (async () => {
        console.log('#useEffect :');
        const token = window.localStorage.getItem('appToken');
        try {
          const response = await fetch(
            `${Constants.REST_ENDPOINT}/search?a=getTree`,
            {
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
            }
          );

          if (response.ok) {
            const results = await response.json();
            console.log(results);
            setTree(results.tree);
          } else {
            console.log('Network response was not ok.');
          }
        } catch (error) {
          console.error('Error: ' + error);
        }
      })();
    }
    // eslint-disable-next-line
  }, [showTree, showGraph]);

  let drawerClasses = 'side-drawer';
  if (props.show) {
    drawerClasses = 'side-drawer open';
  }
  return (
    <div className={drawerClasses}>
      <h1>Side Bar</h1>
      <div style={{ textAlign: 'left' }}>
        <SearchTextForm />
      </div>
      <UploadForm />
      <button onClick={e => toggleShowTree(!showTree)}>Toggle Show Tree</button>
      {showTree ? (
        <div className="scroll">
          <Tree items={tree} />
        </div>
      ) : (
        <div>Tree - Hidden</div>
      )}
      <button onClick={e => toggleShowGraph(!showGraph)}>
        Toggle Show Graph
      </button>
      {showGraph && tree.length ? (
        <NetworkGraph nodes={tree} />
      ) : (
        <div>Graph - Hidden</div>
      )}
      <hr />
      <div>
        <DeleteBtn path={props.documentInfo.path} />
      </div>
      <div className="drawer-footer">Notesee App v{pkg.version}</div>
    </div>
  );
}

export default SlideDrawer;
