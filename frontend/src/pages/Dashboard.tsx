import React from 'react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

interface DashboardProps {
  session: Session;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  return (
    <div>
      <h1>Welcome, {session.user.email}</h1>
      <p>This is your dashboard. More features coming soon!</p>
      <button onClick={() => supabase.auth.signOut()}>
        Sign Out
      </button>
    </div>
  );
};

export default Dashboard; 