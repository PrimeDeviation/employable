import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

interface MCPToken {
  id: string;
  name: string;
  created_at: string;
  expires_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

interface NewTokenResponse {
  id: string;
  token: string;
  name: string;
  expires_at: string;
}

const MCPTokenManager: React.FC = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<MCPToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newToken, setNewToken] = useState<NewTokenResponse | null>(null);
  const [showNewToken, setShowNewToken] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTokens();
    }
  }, [user]);

  const fetchTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('mcp_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error('Error fetching MCP tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const createToken = async () => {
    if (!newTokenName.trim()) return;

    try {
      setCreating(true);
      const { data, error } = await supabase.rpc('generate_mcp_token', {
        p_name: newTokenName.trim(),
        p_expires_days: 365
      });

      if (error) throw error;

      setNewToken(data);
      setShowNewToken(true);
      setNewTokenName('');
      await fetchTokens();
    } catch (error) {
      console.error('Error creating MCP token:', error);
      alert('Failed to create MCP token');
    } finally {
      setCreating(false);
    }
  };

  const revokeToken = async (tokenId: string) => {
    if (!window.confirm('Are you sure you want to revoke this token? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('mcp_tokens')
        .update({ is_active: false })
        .eq('id', tokenId);

      if (error) throw error;
      await fetchTokens();
    } catch (error) {
      console.error('Error revoking token:', error);
      alert('Failed to revoke token');
    }
  };

  const deleteToken = async (tokenId: string) => {
    if (!window.confirm('Are you sure you want to delete this token? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('mcp_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;
      await fetchTokens();
    } catch (error) {
      console.error('Error deleting token:', error);
      alert('Failed to delete token');
    }
  };

  const handleCloseModal = () => {
    setShowNewToken(false);
    setNewToken(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-4">Loading MCP tokens...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          MCP API Tokens
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Generate API tokens to authenticate MCP clients and AI agents with your account.
        </p>
      </div>

      {/* New Token Dialog */}
      {showNewToken && newToken && (
        <div className="mt-4 p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
            Token Created Successfully!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Store this token securely - you won't be able to see it again.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                Your MCP Token:
              </label>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-md border border-green-200 dark:border-green-700 text-sm font-mono break-all text-gray-900 dark:text-gray-100">
                {newToken.token}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <span className="mr-2">🔧</span>
                Setup Instructions for Cursor
              </h4>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Option 1 (Recommended): Environment Variable
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mb-2">
                    Set this in your terminal before starting Cursor:
                  </p>
                  <code className="block p-2 bg-blue-100 dark:bg-blue-900/40 rounded text-blue-900 dark:text-blue-100 font-mono text-xs overflow-x-auto">
                    export MCP_TOKEN="{newToken.token}"
                  </code>
                </div>

                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Option 2: Secure Token File
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mb-2">
                    Create a secure file in your home directory:
                  </p>
                  <code className="block p-2 bg-blue-100 dark:bg-blue-900/40 rounded text-blue-900 dark:text-blue-100 font-mono text-xs overflow-x-auto">
                    echo "{newToken.token}" {"> ~/.employable-mcp-token"}<br/>
                    chmod 600 ~/.employable-mcp-token
                  </code>
                </div>

                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    MCP Server URL:
                  </p>
                  <code className="block p-2 bg-blue-100 dark:bg-blue-900/40 rounded text-blue-900 dark:text-blue-100 font-mono text-xs overflow-x-auto">
                    http://127.0.0.1:54321/functions/v1/mcp-server
                  </code>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-yellow-800 dark:text-yellow-200 text-xs flex items-start">
                    <span className="mr-2 mt-0.5">⚠️</span>
                    <span>
                      <strong>Security Notice:</strong> Keep this token secure. Don't share it or commit it to version control. 
                      The token authenticates as your user account and provides access to your profile data.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleCloseModal} variant="secondary">
              I've Saved My Token
            </Button>
          </div>
        </div>
      )}

      {/* Create New Token */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Create New Token
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Token name (e.g., 'My AI Agent')"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <Button
            onClick={createToken}
            disabled={creating || !newTokenName.trim()}
          >
            {creating ? 'Creating...' : 'Create Token'}
          </Button>
        </div>
      </div>

      {/* Existing Tokens */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Existing Tokens
        </h4>
        {tokens.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No MCP tokens created yet.
          </p>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100">
                      {token.name}
                    </h5>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                      <div>Created: {formatDate(token.created_at)}</div>
                      <div>Expires: {formatDate(token.expires_at)}</div>
                      {token.last_used_at && (
                        <div>Last used: {formatDate(token.last_used_at)}</div>
                      )}
                      <div>
                        Status: 
                        <span className={`ml-1 ${token.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {token.is_active ? 'Active' : 'Revoked'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {token.is_active && (
                      <Button
                        onClick={() => revokeToken(token.id)}
                        size="sm"
                        variant="outline"
                      >
                        Revoke
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteToken(token.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MCPTokenManager; 