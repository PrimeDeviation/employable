import { useState } from 'react';
import { supabase } from '../../../supabaseClient';

interface CreateOfferData {
  title: string;
  description: string;
  offer_type: 'client_offer' | 'team_offer';
  objectives?: string[];
  required_skills?: string[];
  services_offered?: string[];
  budget_min?: number;
  budget_max?: number;
  budget_type?: 'fixed' | 'hourly' | 'milestone' | 'negotiable';
  team_size?: number;
  experience_level?: 'junior' | 'mid' | 'senior' | 'expert';
  team_id: number;
}

export function useCreateOffer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOffer = async (data: CreateOfferData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create an offer');
      }

      // Create structured description using the same template logic as MCP server
      let structuredDescription = data.description;

      if (data.offer_type === 'client_offer' && data.objectives && data.required_skills) {
        structuredDescription = `${data.description}

## Project Objectives
${data.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

## Required Skills
${data.required_skills.map(skill => `• ${skill}`).join('\n')}

## Budget Information
Budget Range: ${data.budget_min && data.budget_max ? `$${data.budget_min} - $${data.budget_max}` : data.budget_min ? `From $${data.budget_min}` : data.budget_max ? `Up to $${data.budget_max}` : 'Negotiable'}
Budget Type: ${data.budget_type || 'negotiable'}`;
      } else if (data.offer_type === 'team_offer' && data.services_offered) {
        structuredDescription = `${data.description}

## Services Offered
${data.services_offered.map(service => `• ${service}`).join('\n')}

## Team Information
${data.team_size ? `Team Size: ${data.team_size} members` : 'Team Size: Flexible'}
Experience Level: ${data.experience_level || 'Mid-level'}`;
      }

      const { data: offer, error } = await supabase
        .from('offers')
        .insert({
          title: data.title,
          description: structuredDescription,
          offer_type: data.offer_type,
          created_by: user.id,
          team_id: data.team_id,
          budget_min: data.budget_min || null,
          budget_max: data.budget_max || null,
          budget_type: data.budget_type || 'negotiable'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return offer;
    } catch (err) {
      console.error('Create offer error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create offer';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createOffer,
    isLoading,
    error
  };
} 