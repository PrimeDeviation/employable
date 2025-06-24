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
  const { user, session } = useAuth();
  const [tokens, setTokens] = useState<MCPToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newToken, setNewToken] = useState<NewTokenResponse | null>(null);
  const [showNewToken, setShowNewToken] = useState(false);
  const [expirationOption, setExpirationOption] = useState<'1year' | '5years' | 'never'>('1year');

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

  const getExpirationDays = (option: string): number | null => {
    switch (option) {
      case '1year': return 365;
      case '5years': return 365 * 5;
      case 'never': return null; // No expiration
      default: return 365;
    }
  };

  const createToken = async () => {
    if (!newTokenName.trim()) return;

    try {
      setCreating(true);
      const expirationDays = getExpirationDays(expirationOption);
      
      const { data, error } = await supabase.rpc('generate_mcp_jwt_token', {
        p_name: newTokenName.trim(),
        p_expires_days: expirationDays
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

  const getProviderInfo = () => {
    const provider = user?.app_metadata?.provider;
    const isOAuth = provider && provider !== 'email';
    return {
      isOAuth,
      provider: provider || 'email',
      providerName: provider === 'github' ? 'GitHub' : provider === 'google' ? 'Google' : 'Email'
    };
  };

  if (loading) {
    return <div className="text-center py-4">Loading MCP tokens...</div>;
  }

  const { isOAuth, providerName } = getProviderInfo();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Long-Lasting MCP API Tokens
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Generate persistent API tokens for MCP clients (Cursor, Claude Desktop, etc.) that won't expire during normal usage.
          </p>
          {isOAuth && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <span>🔗</span>
              <span>Connected via {providerName} OAuth</span>
            </div>
          )}
        </div>
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
                Long-Lasting Token Created!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                This token {expirationOption === 'never' ? 'never expires' : `expires in ${expirationOption.replace('years', ' years').replace('year', ' year')}`}. Store it securely - you won't see it again.
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
                Setup Instructions for MCP Clients
              </h4>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    For Cursor IDE:
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mb-2">
                    Add to your <code>.cursor/mcp.json</code>:
                  </p>
                  <code className="block p-2 bg-blue-100 dark:bg-blue-900/40 rounded text-blue-900 dark:text-blue-100 font-mono text-xs overflow-x-auto">
                    {`{
  "mcpServers": {
    "employable-agents": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "https://kvtqkvifglyytdsvsyzo.supabase.co",
        "SUPABASE_ANON_KEY": "${newToken.token}"
      }
    }
  }
}`}
                  </code>
                </div>

                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    For Claude Desktop:
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mb-2">
                    Add to your Claude Desktop config:
                  </p>
                  <code className="block p-2 bg-blue-100 dark:bg-blue-900/40 rounded text-blue-900 dark:text-blue-100 font-mono text-xs overflow-x-auto">
                    {`{
  "mcpServers": {
    "employable": {
      "command": "node",
      "args": ["path/to/mcp-client.js"],
      "env": {
        "MCP_TOKEN": "${newToken.token}",
        "MCP_SERVER_URL": "https://kvtqkvifglyytdsvsyzo.supabase.co/functions/v1/mcp-server"
      }
    }
  }
}`}
                  </code>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-yellow-800 dark:text-yellow-200 text-xs flex items-start">
                    <span className="mr-2 mt-0.5">🔒</span>
                    <span>
                      <strong>Security:</strong> This token provides full access to your account. Keep it secure, don't share it, and don't commit it to version control.
                      {expirationOption === 'never' && ' Since this token never expires, treat it like a password.'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleCloseModal} variant="secondary">
              I've Saved My Token Securely
            </Button>
          </div>
        </div>
      )}

      {/* Create New Token */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Create New Long-Lasting Token
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Token Name
            </label>
            <input
              type="text"
              placeholder="e.g., 'Cursor IDE', 'My AI Assistant', 'Production Bot'"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Token Lifetime
            </label>
            <select
              value={expirationOption}
              onChange={(e) => setExpirationOption(e.target.value as '1year' | '5years' | 'never')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="1year">1 Year (Recommended)</option>
              <option value="5years">5 Years (Long-term projects)</option>
              <option value="never">Never Expires (Use with caution)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {expirationOption === '1year' && 'Good balance of security and convenience'}
              {expirationOption === '5years' && 'For long-term integrations and automation'}
              {expirationOption === 'never' && 'Maximum convenience but requires careful security management'}
            </p>
          </div>

          <Button
            onClick={createToken}
            disabled={creating || !newTokenName.trim()}
            className="w-full"
          >
            {creating ? 'Creating Token...' : 'Create Long-Lasting Token'}
          </Button>
        </div>
      </div>

      {/* Existing Tokens */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Your Active Tokens
        </h4>
        {tokens.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No MCP tokens created yet.</p>
            <p className="text-sm mt-1">Create your first token above to get started with MCP clients.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100">
                      {token.name}
                    </h5>
                    {!token.is_active && (
                      <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                        Revoked
                      </span>
                    )}
                    {!token.expires_at && (
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        Never Expires
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <p>Created: {formatDate(token.created_at)}</p>
                    {token.expires_at && (
                      <p>Expires: {formatDate(token.expires_at)}</p>
                    )}
                    {token.last_used_at && (
                      <p>Last used: {formatDate(token.last_used_at)}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {token.is_active && (
                    <Button
                      onClick={() => revokeToken(token.id)}
                      variant="secondary"
                      size="sm"
                    >
                      Revoke
                    </Button>
                  )}
                  <Button
                    onClick={() => deleteToken(token.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
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