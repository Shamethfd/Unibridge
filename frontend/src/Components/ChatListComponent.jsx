import React, { useState, useEffect } from 'react';
import {
  getAvailableTutors,
  getUserConversations,
  startConversation,
  getTotalUnreadCount,
  getApiErrorMessage,
} from '../services/api';

const ChatListComponent = ({ onSelectConversation, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [availableTutors, setAvailableTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTutorList, setShowTutorList] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    loadData();
    // Refresh unread count every 10 seconds
    const interval = setInterval(loadUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const decoded = JSON.parse(atob(String(token).replace(/^"|"$/g, '').split('.')[1]));
      setCurrentUserId(decoded?.id || '');
    } catch {
      setCurrentUserId('');
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadConversations(),
        loadAvailableTutors(),
        loadUnreadCount(),
      ]);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await getUserConversations();
      const list = Array.isArray(response.data) ? response.data : [];
      setConversations(list);

      if (!selectedConversationId && list.length > 0) {
        onSelectConversation(list[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadAvailableTutors = async () => {
    try {
      const response = await getAvailableTutors();
      setAvailableTutors(response.data);
    } catch (err) {
      console.error('Failed to load tutors:', err);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await getTotalUnreadCount();
      setTotalUnread(response.data.totalUnread);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const handleSelectConversation = (conversation) => {
    onSelectConversation(conversation);
    setShowTutorList(false);
  };

  const handleStartConversation = async (tutor) => {
    try {
      // Prefer linked User id to keep participant mapping correct.
      const tutorId = tutor.userId || tutor._id || tutor.studentId;
      if (!tutorId) {
        setError('Invalid tutor ID');
        return;
      }
      const response = await startConversation(tutorId);
      const newConversation = response.data;
      setConversations([newConversation, ...conversations]);
      handleSelectConversation(newConversation);
      setShowTutorList(false);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError(getApiErrorMessage(err));
    }
  };

  const getUserDisplayName = (userObj) => {
    if (!userObj) return '';
    const firstName = userObj?.firstName || userObj?.profile?.firstName || '';
    const lastName = userObj?.lastName || userObj?.profile?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
    return userObj?.username || userObj?.email || '';
  };

  const getConversationName = (conversation) => {
    if (!conversation?.participants?.length) return 'Unknown User';

    const otherParticipant = conversation.participants.find((p) => {
      const pid = typeof p?.userId === 'string' ? p.userId : p?.userId?._id;
      return pid && pid !== currentUserId;
    }) || conversation.participants[0];

    const userObj = typeof otherParticipant?.userId === 'object' ? otherParticipant.userId : null;
    const displayName = getUserDisplayName(userObj);
    if (displayName) return displayName;
    return otherParticipant?.role === 'tutor' ? 'Tutor' : 'Student';
  };

  if (loading) {
    return (
      <div className="w-full md:max-w-[360px] h-full border-r border-neutral-200 bg-neutral-50 flex items-center justify-center px-4 text-center text-sm text-neutral-500">
        Loading conversations...
      </div>
    );
  }

  return (
    <div className="w-full md:max-w-[360px] h-full border-r border-neutral-200 bg-neutral-50 flex flex-col">
      <div className="px-4 py-4 border-b border-neutral-200 bg-white flex items-center justify-between">
        <h2 className="text-xl font-gilroyBold text-neutral-800">Messages</h2>
        {totalUnread > 0 && (
          <span className="min-w-6 h-6 px-1 bg-danger-500 text-white rounded-full inline-flex items-center justify-center text-[11px] font-gilroyBold">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </div>

      {error && <div className="px-4 py-2 bg-danger-50 text-danger-600 text-sm border-b border-danger-200">{error}</div>}

      <button
        className="mx-3 mt-3 mb-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-gilroyMedium transition-colors"
        onClick={() => setShowTutorList(!showTutorList)}
      >
        {showTutorList ? 'Hide Tutors' : '+ New Chat'}
      </button>

      {showTutorList && (
        <div className="px-4 py-3 border-b border-neutral-200 max-h-[280px] overflow-y-auto space-y-2">
          <h3 className="text-sm font-gilroyBold text-neutral-700">Available Tutors</h3>
          {availableTutors.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-neutral-400">No tutors available</p>
          ) : (
            availableTutors.map((tutor) => (
              <div
                key={tutor._id}
                className="p-3 bg-white border border-neutral-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 cursor-pointer transition-colors flex items-center justify-between gap-3"
                onClick={() => handleStartConversation(tutor)}
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-gilroyBold text-neutral-800 truncate">{tutor.studentName}</h4>
                  <p className="text-xs text-neutral-500 truncate">
                    {tutor.subjects && tutor.subjects.length > 0
                      ? tutor.subjects.join(', ')
                      : 'No subjects'}
                  </p>
                </div>
                <span className="text-primary-500 text-lg">→</span>
              </div>
            ))
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="px-2 mb-2 text-sm font-gilroyBold text-neutral-700">Conversations</h3>
        {conversations.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-neutral-400">
            No conversations yet. Start a chat with a tutor!
          </p>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`p-3 mb-2 rounded-lg border cursor-pointer transition-colors ${
                selectedConversationId === conversation._id
                  ? 'bg-primary-500 text-white border-primary-600'
                  : 'bg-white border-neutral-200 hover:bg-neutral-100 text-neutral-800'
              }`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-gilroyBold truncate">{getConversationName(conversation)}</h4>
                  <p
                    className={`text-xs truncate ${
                      selectedConversationId === conversation._id ? 'text-white/80' : 'text-neutral-500'
                    }`}
                  >
                    {conversation.lastMessage?.text || 'No messages yet'}
                  </p>
                </div>
                <div
                  className={`text-[11px] mt-0.5 whitespace-nowrap ${
                    selectedConversationId === conversation._id ? 'text-white/70' : 'text-neutral-400'
                  }`}
                >
                  {conversation.lastMessage?.timestamp && new Date(conversation.lastMessage.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatListComponent;
