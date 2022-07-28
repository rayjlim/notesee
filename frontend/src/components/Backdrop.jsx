/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import './Backdrop.css';

const Backdrop = ({ close }) => <div className="backdrop" onClick={close} />;

export default Backdrop;

Backdrop.propTypes = {
  close: PropTypes.func.isRequired,
};
