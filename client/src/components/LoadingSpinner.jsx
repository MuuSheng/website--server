import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message, fullScreen }) => {
  return (
    <div className={fullScreen ? 'loading-fullscreen' : 'loading-container'}>
      <div className="loading-spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  fullScreen: PropTypes.bool
};

LoadingSpinner.defaultProps = {
  message: '',
  fullScreen: false
};

export default LoadingSpinner;