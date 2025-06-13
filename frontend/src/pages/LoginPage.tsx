import { supabase } from '../supabaseClient';
import React, { useState } from 'react';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('individual_contributor');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            role: role,
          },
        },
      });
      if (error) throw error;
      alert('Check your email for the login link!');
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h1>Employable</h1>
        <p>Sign in or sign up via magic link with your email below</p>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="role">I am a...</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="individual_contributor">Consultant (Individual)</option>
            <option value="team_leader">Consultant (Team Leader)</option>
            <option value="hiring_organization">Hiring Organization</option>
          </select>
          <button disabled={loading}>
            {loading ? <span>Loading</span> : <span>Send magic link</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 