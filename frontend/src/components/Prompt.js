import React from 'react';

class Prompt extends React.Component {
  componentDidMount() {
    window.addEventListener('beforeunload', this.beforeunload.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.beforeunload.bind(this));
  }

  beforeunload(e) {
    if (this.props.dataUnsaved) {
      e.preventDefault();
      e.returnValue = true;
    }
  }

  render() {
    return <div></div>;
  }
}

export default Prompt;
