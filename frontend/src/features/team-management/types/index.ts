export interface Team {
  id: number;
  owner_id: string;
  name: string;
  description?: string;
  skills?: string[];
  location?: string;
  remote_work: boolean;
  team_size?: number;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  availability?: 'available' | 'busy' | 'unavailable';
  website?: string;
  public_profile: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TeamMember {
  team_id: number;
  user_id: string;
  role?: 'owner' | 'admin' | 'member';
  joined_at?: string;
  // Profile information when fetched with joins (note: API returns 'profiles' not 'profile')
  profiles?: {
    id: string;
    username: string; // username is the email address
    full_name?: string;
    avatar_url?: string;
  };
}

export interface TeamWithMembers extends Team {
  team_members: TeamMember[];
  member_count: number;
  is_owner: boolean;
  is_member: boolean;
}

export interface TeamFilters {
  skills?: string[];
  location?: string;
  availability?: 'available' | 'busy' | 'unavailable';
  remote_work?: boolean;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  search?: string;
}

export interface CreateTeamData {
  name: string;
  description?: string;
  skills?: string[];
  location?: string;
  remote_work?: boolean;
  team_size?: number;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  availability?: 'available' | 'busy' | 'unavailable';
  website?: string;
  public_profile?: boolean;
}

export interface UpdateTeamData extends Partial<CreateTeamData> {
  id: number;
}

export interface TeamInvitation {
  id: number;
  team_id: number;
  inviter_id: string;
  invitee_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  expires_at?: string;
} 