import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Graph from 'react-vis-network-graph';
import constants from '../constants';

// import "./styles.css";
// need to import the vis network css in order to show tooltip
// import "./network.css";

const NetworkGraph = ({ nodes }) => {
  const [graph, setGraph] = useState({
    //   { id: 1, label: "Node 1", title: "node 1 tootip text" },
    nodes: nodes.map(item => {
      const { path, hasString } = item;
      const output = path
        .replace(/^.+\/([^/]*)$/, '$1')
        .replace(/\.md/, '');

      const color = hasString === '1'
        ? 'red' : 'aqua';
      return {
        id: path,
        label: output,
        title: path,
        color,
      };
    }),
    edges: [],
  });

  const graphOptions = {
    layout: {
      hierarchical: false,
    },
    edges: {
      color: '#000000',
    },
    height: '500px',
  };

  const events = {
    select: event => {
      const localNodes = event.nodes;
      if (localNodes) {
        alert(`going to ${localNodes}`);
        const r = true;
        if (r) {
          window.location = `/${localNodes}`;
        }
      }
    },
  };

  useEffect(() => {
    (async () => {
      // TODO: convert to custom hook
      try {
        const token = window.localStorage.getItem(constants.STORAGE_KEY);
        const response = await fetch(`${constants.REST_ENDPOINT}/?a=network`, {
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
          const results = await response.json();
          const edgesResult = results.map(item => ({
            from: item.target,
            to: item.source,
          }));
          console.log('results', edgesResult);

          setGraph({ ...graph, edges: edgesResult });
        } else {
          console.log('Network response was not ok.');
        }
      } catch (error) {
        console.error('Error: ', error);
      }
    })();
  }, []);

  console.log(graph);
  return (
    <div>
      {(graph.nodes.length && graph.edges.length) ? (
        <Graph graph={graph} options={graphOptions} events={events} />
      ) : (
        <>Loading Graph</>
      )}
    </div>
  );
};

export default NetworkGraph;

NetworkGraph.propTypes = {
  nodes: PropTypes.array.isRequired,
};
