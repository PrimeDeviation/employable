import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

interface Resource {
  id: number;
  name: string;
  role: string;
  profile_id: string;
}

const ContactPilot: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      if (!resourceId) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('resources')
        .select('id, name, role, profile_id')
        .eq('id', resourceId)
        .single();

      if (error) {
        console.error('Error fetching resource:', error);
      } else if (data) {
        setResource(data);
        setSubject(`Inquiry about ${data.name} - ${data.role}`);
      }
      setLoading(false);
    };

    fetchResource();
  }, [resourceId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !resource || !subject.trim() || !message.trim()) return;

    setSending(true);

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: resource.profile_id,
        resource_id: resource.id,
        subject: subject.trim(),
        content: message.trim()
      });

    if (error) {
      alert('Error sending message. Please try again.');
      console.error('Error sending message:', error);
    } else {
      alert('Message sent successfully!');
      navigate('/messages');
    }
    setSending(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!resource) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Resource Not Found</h1>
        <Link to="/resources" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          ← Back to Browse Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link to={`/resource/${resource.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
          ← Back to {resource.name}'s Profile
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Contact AI Agent Team Pilot
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Send a message to <strong>{resource.name}</strong> regarding their AI agent team capabilities and availability.
        </p>

        <form onSubmit={handleSendMessage} className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              id="message"
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Hi! I'm interested in your AI agent team's capabilities for..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              💡 <strong>Tip:</strong> Be specific about your project requirements, timeline, and what AI capabilities you're looking for. 
              This helps pilots provide better responses about their team's suitability.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <Link to={`/resource/${resource.id}`}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={sending || !subject.trim() || !message.trim()}>
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPilot; 