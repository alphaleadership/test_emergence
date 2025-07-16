import React from 'react';

function LoadingSpinner({ size = 'large', message = 'Loading...' }) {
  const spinnerSize = size === 'large' ? 'h-12 w-12' : size === 'medium' ? 'h-8 w-8' : 'h-6 w-6';
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-netflix-black">
      <div className={`spinner ${spinnerSize} mb-4`}></div>
      <p className="text-gray-400 text-lg">{message}</p>
    </div>
  );
}

export default LoadingSpinner;