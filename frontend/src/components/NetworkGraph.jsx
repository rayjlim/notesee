import React, { useEffect, useState, Fragment } from 'react';
import Graph from 'react-vis-network-graph';
import Constants from '../constants';

// import "./styles.css";
// need to import the vis network css in order to show tooltip
// import "./network.css";

function NetworkGraph(props) {
  const token = window.localStorage.getItem('appToken');
  const [graph, setGraph] = useState({
    // /network?a=network
    //   { id: 1, label: "Node 1", title: "node 1 tootip text" },
    nodes: props.nodes.map(item => {
      const output = item
        .substring(0, item.length - 3)
        .replace(/^.+\/([^/]*)$/, '$1');
      return { id: item, label: output, title: item };
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
    select: function (event) {
      var { nodes } = event;
      if (nodes ) {
        alert(`going to ${nodes}`)
        var r = true;
        if (r)
          window.location = `/${nodes}`;
        
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${Constants.REST_ENDPOINT}/network?a=network`, {
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
          const edgesResult = results.map((item, id) => ({
            from: item.target,
            to: item.source,
          }));
          console.log('results', edgesResult);

          setGraph({ ...graph, edges: edgesResult });
        } else {
          console.log('Network response was not ok.');
        }
      } catch (error) {
        console.error('Error: ' + error);
      }
    })();
  }, []);

  console.log(graph);
  return (
    <Fragment>
      {(graph.nodes.length && graph.edges.length) ? (
        <Graph graph={graph} options={graphOptions} events={events} />
      ) : (
        <Fragment>Loading Graph</Fragment>
      )}
    </Fragment>
  );
}

export default NetworkGraph;
