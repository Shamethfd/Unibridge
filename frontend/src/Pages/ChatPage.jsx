import React, { useState, useEffect } from 'react';
import ChatListComponent from '../Components/ChatListComponent';
import ChatWindowComponent from '../Components/ChatWindowComponent';
import { initSocket, disconnectSocket } from '../services/chatSocket';

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [chatListRefreshKey, setChatListRefreshKey] = useState(0);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const cleanToken = String(token).replace(/^"|"$/g, '');
        initSocket(cleanToken);
        setSocketInitialized(true);
      }
    } catch (error) {
      console.error('Failed to initialize Socket.io:', error);
    }
    return () => {
      disconnectSocket();
      setSocketInitialized(false);
    };
  }, []);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleConversationDeleted = () => {
    setSelectedConversation(null);
    setChatListRefreshKey((prev) => prev + 1);
  };

  /* ── Loading state ── */
  if (!socketInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-5">
          {/* Animated logo mark */}
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg shadow-blue-200"
            style={{ background: 'linear-gradient(135deg, #094886, #2563eb)' }}
          >
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
            {/* Spinning ring */}
            <span
              className="absolute inset-0 rounded-2xl border-4 border-transparent animate-spin"
              style={{ borderTopColor: '#2563eb', opacity: 0.4 }}
            />
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-slate-800">Initializing chat</p>
            <p className="mt-1 text-xs text-slate-400">Setting up your secure connection…</p>
          </div>

          {/* Bouncing dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full animate-bounce"
                style={{
                  background: '#2563eb',
                  animationDelay: `${i * 150}ms`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Main layout ── */
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-100">

      {/* Top bar */}
      <header
        className="flex h-14 shrink-0 items-center gap-3 px-5 shadow-md"
        style={{ background: 'linear-gradient(90deg, #094886 0%, #1a5fa0 60%, #2563eb 100%)' }}
      >
        {/* Logo mark */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
          <svg
            className="h-4.5 w-4.5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        </div>

        <div>
          <p className="text-sm font-bold leading-none text-white">Messages</p>
        </div>
      </header>

      {/* Chat body */}
      <div className="flex flex-1 overflow-hidden p-3 gap-3">

        {/* Sidebar — conversation list */}
        <aside className="hidden w-72 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200 md:flex md:flex-col xl:w-80">
          <ChatListComponent
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?._id}
            refreshKey={chatListRefreshKey}
          />
        </aside>

        {/* Main — chat window */}
        <main className="flex flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200">
          {selectedConversation ? (
            <ChatWindowComponent
              conversation={selectedConversation}
              onConversationDeleted={handleConversationDeleted}
            />
          ) : (
            /* Empty / no-selection state */
            <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center p-8">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl shadow-blue-100"
                style={{ background: 'linear-gradient(135deg, #094886, #2563eb)' }}
              >
                <svg
                  className="h-10 w-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800">Your messages</h3>
                <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-400">
                  Select a conversation from the list to start chatting.
                </p>
              </div>

              <div
                className="rounded-xl border px-4 py-3 text-xs text-slate-500"
                style={{ borderColor: '#094886' + '25', background: '#094886' + '06' }}
              >
                <span style={{ color: '#094886' }} className="font-semibold">Tip:</span>{' '}
                All your messages are end-to-end encrypted.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatPage;