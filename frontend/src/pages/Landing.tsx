import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center px-4">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-4">Welcome to Employable Agents</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          The AI-driven platform for finding your next contract and managing your professional profile. Vibe Contracting starts here.
        </p>
        <Link to="/login">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition">Login or Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default Landing; 