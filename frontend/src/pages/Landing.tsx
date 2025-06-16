import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-lg w-full text-center">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-4">Welcome to Employable</h1>
        <p className="text-lg text-gray-600 mb-8">The premier marketplace for technical consulting teams.</p>
        <Link to="/login">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition">Login or Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default Landing; 