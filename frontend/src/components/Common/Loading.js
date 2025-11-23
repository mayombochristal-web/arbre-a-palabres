import React from 'react';

const Loading = ({ message = "Chargement..." }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner large"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ size = 'medium' }) => {
  return <div className={`loading-spinner ${size}`}></div>;
};

export const LoadingCard = () => {
  return (
    <div className="card loading-card">
      <div className="loading-placeholder"></div>
      <div className="loading-placeholder short"></div>
      <div className="loading-placeholder medium"></div>
    </div>
  );
};

export default Loading;