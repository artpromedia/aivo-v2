import React from 'react';

export const SkipLink: React.FC = () => {
  return (
    <a 
      href="#main-content" 
      className="skip-link bg-blue-600 text-white px-4 py-2 rounded focus:top-4 focus:left-4"
    >
      Skip to main content
    </a>
  );
};