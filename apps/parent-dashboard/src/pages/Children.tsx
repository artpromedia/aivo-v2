import React from 'react';

const Children: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
        <button className="btn-primary">Add Child</button>
      </div>
      
      <div className="card">
        <div className="card-content">
          <p className="text-gray-500">Children management page - Coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default Children;