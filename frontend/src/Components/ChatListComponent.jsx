import React, { useState, useEffect } from 'react';
import {
  getAvailableTutors,
  getUserConversations,
  startConversation,
  getTotalUnreadCount,
  getApiErrorMessage,
} from '../services/api';

const ChatListComponent = ({ onSelectConversation, selectedConversationId, refreshKey = 0 }) => {
  const [conversations, setConversations] = useState([]);
  const [availableTutors, setAvailableTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTutorList, setShowTutorList] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [currentUserId, setCurrentUserId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { loadData(); }, [refreshKey]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const decoded = JSON.parse(atob(String(token).replace(/^"|"$/g, '').split('.')[1]));
      setCurrentUserId(decoded?.id || '');
    } catch { setCurrentUserId(''); }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadConversations(), loadAvailableTutors(), loadUnreadCount()]);
    } catch (err) { setError(getApiErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const loadConversations = async () => {
    try {
      const response = await getUserConversations();
      const list = Array.isArray(response.data) ? response.data : [];
      setConversations(list);
      if (!selectedConversationId && list.length > 0) onSelectConversation(list[0]);
    } catch (err) { console.error('Failed to load conversations:', err); }
  };

  const loadAvailableTutors = async () => {
    try {
      const response = await getAvailableTutors();
      setAvailableTutors(response.data);
    } catch (err) { console.error('Failed to load tutors:', err); }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await getTotalUnreadCount();
      setTotalUnread(response.data.totalUnread);
    } catch (err) { console.error('Failed to load unread count:', err); }
  };

  const handleSelectConversation = (conversation) => {
    onSelectConversation(conversation);
    setShowTutorList(false);
  };

  const handleStartConversation = async (tutor) => {
    try {
      const tutorId = tutor.userId || tutor._id || tutor.studentId;
      if (!tutorId) { setError('Invalid tutor ID'); return; }
      const response = await startConversation(tutorId);
      const newConversation = response.data;
      setConversations([newConversation, ...conversations]);
      handleSelectConversation(newConversation);
      setShowTutorList(false);
    } catch (err) { setError(getApiErrorMessage(err)); }
  };

  const getUserDisplayName = (userObj) => {
    if (!userObj) return '';
    const name = `${userObj?.firstName || userObj?.profile?.firstName || ''} ${userObj?.lastName || userObj?.profile?.lastName || ''}`.trim();
    return name || userObj?.username || userObj?.email || '';
  };

  const getConversationName = (conversation) => {
    if (!conversation?.participants?.length) return 'Unknown User';
    const other = conversation.participants.find((p) => {
      const pid = typeof p?.userId === 'string' ? p.userId : p?.userId?._id;
      return pid && pid !== currentUserId;
    }) || conversation.participants[0];
    const userObj = typeof other?.userId === 'object' ? other.userId : null;
    const name = getUserDisplayName(userObj);
    return name || (other?.role === 'tutor' ? 'Tutor' : 'Student');
  };

  const getInitials = (name) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter((c) =>
    getConversationName(c).toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="flex h-full w-full flex-col">
        {/* Skeleton header */}
        <div className="border-b border-slate-100 px-4 py-4"
          style={{ background: 'linear-gradient(90deg, #094886, #2563eb)' }}>
          <div className="h-5 w-28 animate-pulse rounded-full bg-white/20" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-100" />
                <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50">

      {/* ── Header ── */}
      <div className="shrink-0 px-4 pb-3 pt-4"
        style={{ background: 'linear-gradient(135deg, #094886 0%, #1a5fa0 55%, #2563eb 100%)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200/70">Inbox</p>
            <h2 className="text-base font-bold text-white leading-tight">Messages</h2>
          </div>
          {totalUnread > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white shadow-md shadow-rose-900/30">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </div>

        {/* Search bar */}
        <div className="relative mt-3">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/50"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-0 bg-white/15 py-2 pl-8 pr-3 text-xs text-white placeholder:text-white/50 outline-none focus:bg-white/25 transition backdrop-blur-sm"
          />
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mx-3 mt-2 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* ── New Chat button ── */}
      <div className="shrink-0 px-3 pt-3">
        <button
          onClick={() => setShowTutorList((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-sm transition-all active:scale-[.98]"
          style={{
            background: showTutorList
              ? 'linear-gradient(135deg, #1e3a5f, #1d4ed8)'
              : 'linear-gradient(135deg, #094886, #2563eb)',
            boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          }}
        >
          {showTutorList ? (
            <>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Chat
            </>
          )}
        </button>
      </div>

      {/* ── Tutor list panel ── */}
      {showTutorList && (
        <div className="mx-3 mt-2 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Available tutors</p>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {availableTutors.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <svg className="h-8 w-8 text-slate-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <p className="text-xs text-slate-400">No tutors available</p>
              </div>
            ) : (
              availableTutors.map((tutor) => (
                <button
                  key={tutor._id}
                  type="button"
                  onClick={() => handleStartConversation(tutor)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 border-b border-slate-50 last:border-0"
                >
                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #094886, #2563eb)' }}>
                    {getInitials(tutor.studentName || 'T')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">{tutor.studentName}</p>
                    <p className="truncate text-[11px] text-slate-400">
                      {tutor.subjects?.length ? tutor.subjects.join(', ') : 'No subjects'}
                    </p>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Conversation list ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 pt-3 space-y-1.5">
        <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Conversations
          {filteredConversations.length > 0 && (
            <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] text-slate-500">
              {filteredConversations.length}
            </span>
          )}
        </p>

        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #094886, #2563eb)' }}>
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600">
                {searchQuery ? 'No results found' : 'No conversations yet'}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {searchQuery ? 'Try a different search term.' : 'Start a chat with a tutor above.'}
              </p>
            </div>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const isSelected = selectedConversationId === conversation._id;
            const name = getConversationName(conversation);
            const lastMsg = conversation.lastMessage?.text || 'No messages yet';
            const timestamp = formatTimestamp(conversation.lastMessage?.timestamp);
            const unread = conversation.unreadCount || 0;

            return (
              <button
                key={conversation._id}
                type="button"
                onClick={() => handleSelectConversation(conversation)}
                className={`w-full rounded-2xl border p-3 text-left transition-all active:scale-[.98] ${
                  isSelected
                    ? 'border-transparent text-white shadow-md shadow-blue-200'
                    : 'border-slate-100 bg-white text-slate-800 hover:border-slate-200 hover:bg-white hover:shadow-sm'
                }`}
                style={isSelected
                  ? { background: 'linear-gradient(135deg, #094886, #2563eb)' }
                  : {}}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                    isSelected ? 'bg-white/20 text-white ring-2 ring-white/30' : 'text-white'
                  }`}
                    style={!isSelected ? { background: 'linear-gradient(135deg, #094886, #2563eb)' } : {}}>
                    {getInitials(name)}
                    {/* Online dot */}
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 ${
                      isSelected ? 'border-blue-700 bg-emerald-400' : 'border-white bg-emerald-400'
                    }`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`truncate text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        {name}
                      </p>
                      <span className={`shrink-0 text-[10px] ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                        {timestamp}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-1">
                      <p className={`truncate text-[11px] ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                        {lastMsg}
                      </p>
                      {unread > 0 && !isSelected && (
                        <span className="ml-1 flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-[#2563eb] px-1 text-[10px] font-bold text-white">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatListComponent;