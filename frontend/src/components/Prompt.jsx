import React from 'react';

class Prompt extends React.Component {
  componentDidMount() {
    window.addEventListener('beforeunload', this.beforeunload.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.beforeunload.bind(this));
  }

  beforeunload(e) {
    // eslint-disable-next-line react/destructuring-assignment, react/prop-types
    if (this.props.dataUnsaved) {
      e.preventDefault();
      e.returnValue = true;
    }
  }

  render() {
    return <> </>;
  }
}

export default Prompt;
