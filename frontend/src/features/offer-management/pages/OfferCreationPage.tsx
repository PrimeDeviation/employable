import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateOffer } from '../hooks/useCreateOffer';
import { useUserTeams } from '../hooks/useUserTeams';

type OfferType = 'client_offer' | 'team_offer';

interface OfferFormData {
  title: string;
  description: string;
  offer_type: OfferType;
  objectives: string[];
  required_skills: string[];
  services_offered: string[];
  budget_min?: number;
  budget_max?: number;
  budget_type: 'fixed' | 'hourly' | 'milestone' | 'negotiable';
  team_size?: number;
  experience_level?: 'junior' | 'mid' | 'senior' | 'expert';
  team_id?: number;
}

export function OfferCreationPage() {
  const navigate = useNavigate();
  const { createOffer, isLoading } = useCreateOffer();
  const { teams, isLoading: teamsLoading } = useUserTeams();
  
  const [formData, setFormData] = useState<OfferFormData>({
    title: '',
    description: '',
    offer_type: 'client_offer',
    objectives: [''],
    required_skills: [''],
    services_offered: [''],
    budget_type: 'negotiable',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.team_id) {
      alert('Please select a team for this offer.');
      return;
    }
    
    try {
      // Filter out empty arrays and create structured description
      const cleanedData = {
        ...formData,
        team_id: formData.team_id,
        objectives: formData.objectives.filter(obj => obj.trim()),
        required_skills: formData.required_skills.filter(skill => skill.trim()),
        services_offered: formData.services_offered.filter(service => service.trim()),
      };

      await createOffer(cleanedData);
      navigate('/offers');
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  };

  const addArrayItem = (field: 'objectives' | 'required_skills' | 'services_offered') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'objectives' | 'required_skills' | 'services_offered', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'objectives' | 'required_skills' | 'services_offered', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create New Offer</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manual control panel for testing MCP offer creation functionality
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Offer Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Offer Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  value="client_offer"
                  checked={formData.offer_type === 'client_offer'}
                  onChange={(e) => setFormData(prev => ({ ...prev, offer_type: e.target.value as OfferType }))}
                  className="mr-2"
                />
                Client Offer (Looking for Team)
              </label>
              <label className="flex items-center text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  value="team_offer"
                  checked={formData.offer_type === 'team_offer'}
                  onChange={(e) => setFormData(prev => ({ ...prev, offer_type: e.target.value as OfferType }))}
                  className="mr-2"
                />
                Team Offer (Offering Services)
              </label>
            </div>
          </div>

          {/* Team Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Team *
            </label>
            <select
              value={formData.team_id || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                team_id: e.target.value ? Number(e.target.value) : undefined 
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              disabled={teamsLoading}
              required
            >
              <option value="">Select a team...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {teamsLoading ? 'Loading teams...' : teams.length === 0 ? 'No teams available. Create a team first.' : 'Select which team this offer is for.'}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Enter offer title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Detailed description of your offer"
            />
          </div>

          {/* Client Offer Fields */}
          {formData.offer_type === 'client_offer' && (
            <>
              {/* Objectives */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Objectives *
                </label>
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateArrayItem('objectives', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Enter objective"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('objectives', index)}
                      className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('objectives')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Objective
                </button>
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Required Skills *
                </label>
                {formData.required_skills.map((skill, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateArrayItem('required_skills', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Enter required skill"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('required_skills', index)}
                      className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('required_skills')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Skill
                </button>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget Min
                  </label>
                  <input
                    type="number"
                    value={formData.budget_min || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Minimum budget"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget Max
                  </label>
                  <input
                    type="number"
                    value={formData.budget_max || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_max: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Maximum budget"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget Type
                  </label>
                  <select
                    value={formData.budget_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                    <option value="milestone">Milestone</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Team Offer Fields */}
          {formData.offer_type === 'team_offer' && (
            <>
              {/* Services Offered */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Services Offered *
                </label>
                {formData.services_offered.map((service, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={service}
                      onChange={(e) => updateArrayItem('services_offered', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Enter service"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('services_offered', index)}
                      className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('services_offered')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Service
                </button>
              </div>

              {/* Team Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Size
                  </label>
                  <input
                    type="number"
                    value={formData.team_size || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, team_size: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Number of team members"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={formData.experience_level || 'mid'}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_level: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-level</option>
                    <option value="senior">Senior</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/offers')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 