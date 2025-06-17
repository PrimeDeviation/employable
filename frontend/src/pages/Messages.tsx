import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

interface Message {
  id: number;
  sender_id: string;
  recipient_id: string;
  resource_id?: number;
  subject: string;
  content: string;
  thread_id: number;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    username?: string;
    full_name?: string;
  };
  recipient_profile?: {
    username?: string;
    full_name?: string;
  };
  resource?: {
    name: string;
    role: string;
  };
}

interface Thread {
  thread_id: number;
  latest_message: Message;
  message_count: number;
  unread_count: number;
  other_party: string;
  other_party_id: string;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<number | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchThreads();
    }
  }, [user]);

  const fetchThreads = async () => {
    if (!user) return;
    setLoading(true);

    // Get all messages where user is sender or recipient
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender_profile:profiles!messages_sender_id_fkey (username, full_name),
        recipient_profile:profiles!messages_recipient_id_fkey (username, full_name),
        resource:resources (name, role)
      `)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
      return;
    }

    // Group messages by thread_id
    const threadMap = new Map<number, Message[]>();
    messages?.forEach(message => {
      const threadId = message.thread_id;
      if (!threadMap.has(threadId)) {
        threadMap.set(threadId, []);
      }
      threadMap.get(threadId)!.push(message);
    });

    // Create thread summaries
    const threadSummaries: Thread[] = Array.from(threadMap.entries()).map(([threadId, msgs]) => {
      const latestMessage = msgs[0]; // Already sorted by created_at desc
      const messageCount = msgs.length;
      const unreadCount = msgs.filter(m => m.recipient_id === user.id && !m.is_read).length;
      
      // Determine the other party
      const otherPartyId = latestMessage.sender_id === user.id ? latestMessage.recipient_id : latestMessage.sender_id;
      const otherPartyProfile = latestMessage.sender_id === user.id ? latestMessage.recipient_profile : latestMessage.sender_profile;
      const otherParty = otherPartyProfile?.full_name || otherPartyProfile?.username || 'Unknown User';

      return {
        thread_id: threadId,
        latest_message: latestMessage,
        message_count: messageCount,
        unread_count: unreadCount,
        other_party: otherParty,
        other_party_id: otherPartyId
      };
    });

    // Sort by latest message time
    threadSummaries.sort((a, b) => new Date(b.latest_message.created_at).getTime() - new Date(a.latest_message.created_at).getTime());

    setThreads(threadSummaries);
    setLoading(false);
  };

  const fetchThreadMessages = async (threadId: number) => {
    if (!user) return;

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender_profile:profiles!messages_sender_id_fkey (username, full_name),
        recipient_profile:profiles!messages_recipient_id_fkey (username, full_name),
        resource:resources (name, role)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching thread messages:', error);
      return;
    }

    setThreadMessages(messages || []);

    // Mark unread messages as read
    const unreadMessages = messages?.filter(m => m.recipient_id === user.id && !m.is_read);
    if (unreadMessages && unreadMessages.length > 0) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadMessages.map(m => m.id));
      
      // Refresh threads to update unread counts
      fetchThreads();
    }
  };

  const handleThreadSelect = (threadId: number) => {
    setSelectedThread(threadId);
    fetchThreadMessages(threadId);
    setReplyContent('');
  };

  const handleSendReply = async () => {
    if (!user || !selectedThread || !replyContent.trim()) return;

    const selectedThreadData = threads.find(t => t.thread_id === selectedThread);
    if (!selectedThreadData) return;

    setSending(true);

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: selectedThreadData.other_party_id,
        resource_id: selectedThreadData.latest_message.resource_id,
        subject: `Re: ${selectedThreadData.latest_message.subject}`,
        content: replyContent.trim(),
        thread_id: selectedThread
      });

    if (error) {
      alert('Error sending reply. Please try again.');
      console.error('Error sending reply:', error);
    } else {
      setReplyContent('');
      fetchThreadMessages(selectedThread);
      fetchThreads();
    }
    setSending(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Messages</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conversations</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {threads.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No conversations yet.
                  <br />
                  <Link to="/resources" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Browse resources to start a conversation
                  </Link>
                </div>
              ) : (
                threads.map(thread => (
                  <button
                    key={thread.thread_id}
                    onClick={() => handleThreadSelect(thread.thread_id)}
                    className={`w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedThread === thread.thread_id ? 'bg-indigo-50 dark:bg-indigo-900' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {thread.other_party}
                      </div>
                      {thread.unread_count > 0 && (
                        <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                      {thread.latest_message.subject}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(thread.latest_message.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          {selectedThread ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {threadMessages[0]?.subject}
                </h3>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto space-y-4">
                {threadMessages.map(message => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-indigo-100 dark:bg-indigo-900 ml-8'
                        : 'bg-gray-100 dark:bg-gray-700 mr-8'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {message.sender_id === user?.id ? 'You' : 
                         (message.sender_profile?.full_name || message.sender_profile?.username || 'Unknown')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(message.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Reply Form */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSendReply} 
                      disabled={sending || !replyContent.trim()}
                      size="sm"
                    >
                      {sending ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                Select a conversation to view messages
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages; 