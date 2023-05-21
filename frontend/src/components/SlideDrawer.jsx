// # SlideDrawer.js
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './SlideDrawer.css';
import pkg from '../../package.json';
import { REST_ENDPOINT, STORAGE_KEY } from '../constants';
import SearchTextForm from './SearchTextForm';
import Tree from './Tree';
import NetworkGraph from './NetworkGraph';
import DeleteBtn from './DeleteBtn';
import UploadForm from './UploadForm';

const SlideDrawer = ({ show, documentInfo }) => {
  const [showTree, toggleShowTree] = useState(false);
  const [showGraph, toggleShowGraph] = useState(false);

  const [tree, setTree] = useState([]);
  const searchText = useRef('');

  useEffect(() => {
    if (showTree || showGraph) {
      (async () => {
        console.log('#useEffect :');
        const token = window.localStorage.getItem(STORAGE_KEY);
        try {
          const queryText = searchText.current.value.replace('#', '%23');
          const response = await fetch(
            `${REST_ENDPOINT}/?a=getTreeSearch&search=${queryText}`,
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
            },
          );

          if (response.ok) {
            const results = await response.json();
            console.log(results);
            setTree(results.tree);
          } else {
            console.log('Network response was not ok.');
          }
        } catch (error) {
          console.error('Error: ', error);
        }
      })();
    }
    // eslint-disable-next-line
  }, [showTree, showGraph]);

  let drawerClasses = 'side-drawer';
  if (show) {
    drawerClasses = 'side-drawer open';
  }

  return (
    <div className={drawerClasses}>
      <h1>Side Bar</h1>
      <div style={{ textAlign: 'center' }}>
        <SearchTextForm />
      </div>
      <UploadForm />

      <input type="text" ref={searchText} />
      <button onClick={() => toggleShowTree(!showTree)} type="button">Toggle Show Tree</button>
      {showTree ? (
        <div className="scroll">
          <Tree items={tree} />
        </div>
      ) : (
        <div>Tree - Hidden</div>
      )}
      <button onClick={() => toggleShowGraph(!showGraph)} type="button">
        Toggle Show Graph
      </button>
      {showGraph && tree.length ? (
        <NetworkGraph nodes={tree} />
      ) : (
        <div>Graph - Hidden</div>
      )}
      <hr />
      <div>
        <DeleteBtn path={documentInfo.path} />
      </div>
      <div className="drawer-footer">
        Notesee App v
        {pkg.version}
      </div>
    </div>
  );
};

export default SlideDrawer;

SlideDrawer.propTypes = {
  show: PropTypes.bool.isRequired,
  documentInfo: PropTypes.object.isRequired,
};
