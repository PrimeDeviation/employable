import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

interface Resource {
  id: number;
  name: string;
  role: string;
  hourly_rate?: number;
  profile_id: string;
  profile: {
    username?: string;
    full_name?: string;
  };
}

const ContractCreate: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resourceId = searchParams.get('resourceId');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pilot_id: '',
    resource_id: resourceId || '',
    hourly_rate: '',
    total_budget: '',
    estimated_hours: '',
    start_date: '',
    end_date: '',
    payment_terms: 'Net 30',
    deliverables: [''],
    ai_capabilities_required: [''],
    computational_requirements: '',
    data_handling_terms: ''
  });

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (resourceId && resources.length > 0) {
      const resource = resources.find(r => r.id.toString() === resourceId);
      if (resource) {
        setFormData(prev => ({
          ...prev,
          pilot_id: resource.profile_id,
          hourly_rate: resource.hourly_rate?.toString() || ''
        }));
      }
    }
  }, [resourceId, resources]);

  const fetchResources = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resources')
      .select(`
        id,
        name,
        role,
        hourly_rate,
        profile_id,
        profile:profiles!inner (username, full_name)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching resources:', error);
    } else {
      setResources((data as any) || []);
    }
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: 'deliverables' | 'ai_capabilities_required', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'deliverables' | 'ai_capabilities_required') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'deliverables' | 'ai_capabilities_required', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleResourceSelect = (resourceId: string) => {
    const resource = resources.find(r => r.id.toString() === resourceId);
    setFormData(prev => ({
      ...prev,
      resource_id: resourceId,
      pilot_id: resource?.profile_id || '',
      hourly_rate: resource?.hourly_rate?.toString() || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitLoading(true);

    // Filter out empty strings from arrays
    const cleanDeliverables = formData.deliverables.filter(d => d.trim() !== '');
    const cleanCapabilities = formData.ai_capabilities_required.filter(c => c.trim() !== '');

    const contractData = {
      client_id: user.id,
      pilot_id: formData.pilot_id,
      resource_id: formData.resource_id ? parseInt(formData.resource_id) : null,
      title: formData.title,
      description: formData.description,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      total_budget: formData.total_budget ? parseFloat(formData.total_budget) : null,
      estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      payment_terms: formData.payment_terms,
      deliverables: cleanDeliverables.length > 0 ? cleanDeliverables : null,
      ai_capabilities_required: cleanCapabilities.length > 0 ? cleanCapabilities : null,
      computational_requirements: formData.computational_requirements || null,
      data_handling_terms: formData.data_handling_terms || null,
      created_by: user.id,
      status: 'draft'
    };

    const { data, error } = await supabase
      .from('contracts')
      .insert(contractData)
      .select()
      .single();

    setSubmitLoading(false);

    if (error) {
      console.error('Error creating contract:', error);
      alert('Error creating contract. Please try again.');
    } else {
      navigate(`/contracts/${data.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Create AI Agent Team Contract
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new contract for engaging an AI agent team pilot and their capabilities.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contract Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="e.g., AI-Powered Customer Service Automation"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Describe the project scope, goals, and expectations..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select AI Agent Team *
              </label>
              {loading ? (
                <div>Loading teams...</div>
              ) : (
                <select
                  required
                  value={formData.resource_id}
                  onChange={(e) => handleResourceSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">Choose a team...</option>
                  {resources.map(resource => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} - {resource.role} 
                      {resource.hourly_rate && ` ($${resource.hourly_rate}/hr)`}
                      {' by '}
                      {resource.profile.full_name || resource.profile.username}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Financial Terms */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Financial Terms
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.hourly_rate}
                onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Budget ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.total_budget}
                onChange={(e) => handleInputChange('total_budget', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => handleInputChange('estimated_hours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Terms
              </label>
              <select
                value={formData.payment_terms}
                onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Upon completion">Upon completion</option>
                <option value="50% upfront, 50% completion">50% upfront, 50% completion</option>
              </select>
            </div>
          </div>
        </div>

        {/* Deliverables */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Deliverables
          </h2>
          
          {formData.deliverables.map((deliverable, index) => (
            <div key={index} className="flex gap-2 mb-3">
              <input
                type="text"
                value={deliverable}
                onChange={(e) => handleArrayInputChange('deliverables', index, e.target.value)}
                placeholder={`Deliverable ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
              />
              {formData.deliverables.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('deliverables', index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('deliverables')}
          >
            Add Deliverable
          </Button>
        </div>

        {/* AI-Specific Requirements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            AI-Specific Requirements
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Required AI Capabilities
              </label>
              {formData.ai_capabilities_required.map((capability, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={capability}
                    onChange={(e) => handleArrayInputChange('ai_capabilities_required', index, e.target.value)}
                    placeholder="e.g., Natural Language Processing, Computer Vision, etc."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                  {formData.ai_capabilities_required.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('ai_capabilities_required', index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('ai_capabilities_required')}
              >
                Add Capability
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Computational Requirements
              </label>
              <textarea
                rows={3}
                value={formData.computational_requirements}
                onChange={(e) => handleInputChange('computational_requirements', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Specify hardware, performance, or infrastructure requirements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Handling Terms
              </label>
              <textarea
                rows={3}
                value={formData.data_handling_terms}
                onChange={(e) => handleInputChange('data_handling_terms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Describe data privacy, security, and handling requirements..."
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/contracts')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitLoading || !formData.title || !formData.description || !formData.pilot_id}
          >
            {submitLoading ? 'Creating...' : 'Create Contract'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContractCreate; 