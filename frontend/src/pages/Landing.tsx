import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div>
      <h1>Welcome to Employable</h1>
      <p>The premier marketplace for technical consulting teams.</p>
      <Link to="/login">
        <button>Login or Sign Up</button>
      </Link>
    </div>
  );
};

export default Landing; 