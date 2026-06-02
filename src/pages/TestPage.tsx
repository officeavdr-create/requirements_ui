import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Frontend Test</h1>
      <p className="text-gray-300 mb-8">
        If you can see this, the React frontend is working correctly!
      </p>
      
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4">System Status</h2>
        <ul className="space-y-2">
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            React 18 loaded
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            TypeScript working
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            Tailwind CSS applied
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            Vite dev server running
          </li>
        </ul>
      </div>
      
      <div className="mt-8">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          onClick={() => alert('Button clicked! Frontend is interactive.')}
        >
          Test Interaction
        </button>
      </div>
    </div>
  );
};

export default TestPage;
