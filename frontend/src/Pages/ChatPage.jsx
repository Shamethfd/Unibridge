import React, { useState, useEffect } from 'react';
import ChatListComponent from '../Components/ChatListComponent';
import ChatWindowComponent from '../Components/ChatWindowComponent';
import { initSocket, disconnectSocket } from '../services/chatSocket';
import './ChatPage.css';

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [socketInitialized, setSocketInitialized] = useState(false);

  // Initialize Socket.io on component mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Remove quotes from token if present
        const cleanToken = String(token).replace(/^"|"$/g, '');
        initSocket(cleanToken);
        setSocketInitialized(true);
      }
    } catch (error) {
      console.error('Failed to initialize Socket.io:', error);
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket();
      setSocketInitialized(false);
    };
  }, []);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  if (!socketInitialized) {
    return (
      <div className="chat-page loading">
        <p>Initializing chat...</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatListComponent
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?._id}
        />
        <ChatWindowComponent conversation={selectedConversation} />
      </div>
    </div>
  );
};

export default ChatPage;
