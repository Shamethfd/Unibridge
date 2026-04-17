import React, { useState, useEffect, useRef } from 'react';
import {
  getConversationMessages,
  sendChatMessage,
  markMessagesAsRead,
  getApiErrorMessage,
} from '../services/api';
import {
  joinConversation,
  leaveConversation,
  sendMessage,
  onReceiveMessage,
  offReceiveMessage,
  onUserTyping,
  onUserStopTyping,
  offUserTyping,
  offUserStopTyping,
  emitTyping,
  emitStopTyping,
} from '../services/chatSocket';
import { FiPaperclip, FiSmile, FiX, FiImage, FiFile } from 'react-icons/fi';

const EMOJIS = ['😀', '😂', '😍', '🥰', '👍', '🙏', '🔥', '🎉', '💯', '😊', '😎', '🤝'];

const ChatWindowComponent = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Get current user ID from localStorage (from auth token)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(decoded.id);
      } catch {
        console.error('Failed to decode token');
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load messages and setup Socket.io when conversation changes
  useEffect(() => {
    if (!conversation || !conversation._id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load message history
        await loadMessages();
        // Mark messages as read
        await markMessagesAsRead(conversation._id);
        // Join conversation room for real-time updates
        joinConversation(conversation._id);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Setup Socket.io listeners
    const handleReceiveMessage = (data) => {
      if (data.conversationId === conversation._id) {
        setMessages((prev) => {
          if (data._id && prev.some((message) => String(message._id) === String(data._id))) {
            return prev;
          }

          return [
            ...prev,
            {
              _id: data._id || Date.now(),
              senderId: data.senderId,
              text: data.text || data.message || '',
              attachments: data.attachments || [],
              createdAt: data.createdAt || data.timestamp,
              senderRole: data.senderRole || 'tutor',
              isRead: false,
            },
          ];
        });
        scrollToBottom();
      }
    };

    const handleUserTyping = ({ userId }) => {
      if (userId !== currentUserId) {
        setTypingUsers((prev) => new Set([...prev, userId]));
      }
    };

    const handleUserStopTyping = ({ userId }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    onReceiveMessage(handleReceiveMessage);
    onUserTyping(handleUserTyping);
    onUserStopTyping(handleUserStopTyping);

    return () => {
      leaveConversation(conversation._id);
      offReceiveMessage();
      offUserTyping();
      offUserStopTyping();
    };
  }, [conversation, currentUserId]);

  const loadMessages = async () => {
    try {
      const response = await getConversationMessages(conversation._id, 1, 200);
      setMessages(response.data.messages);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = '';
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const insertEmoji = (emoji) => {
    setInput((prev) => `${prev}${emoji}`);
    setShowEmojiPicker(false);
  };

  const getAttachmentKind = (file) => {
    if (file.type?.startsWith('image/')) return 'image';
    return 'document';
  };

  const getFileUrl = (attachment) => {
    if (!attachment) return '';
    if (attachment.url) return attachment.url;
    return URL.createObjectURL(attachment);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && selectedFiles.length === 0) return;

    const messageText = input.trim();
    setInput('');
    emitStopTyping(conversation._id);

    try {
      const response = await sendChatMessage(conversation._id, messageText, selectedFiles);
      // Add message to state - ensure proper format
      setMessages((prev) => [
        ...prev,
        {
          ...response.data,
          senderId: response.data.senderId, // Keep original format from API
        },
      ]);
      setSelectedFiles([]);
      setShowEmojiPicker(false);
      scrollToBottom();

      // Emit via socket
      sendMessage(conversation._id, response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setInput(messageText); // Restore input on error
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);

    // Emit typing indicator
    if (!typingTimeoutRef.current) {
      emitTyping(conversation._id);
    }

    // Clear previous timeout
    clearTimeout(typingTimeoutRef.current);

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(conversation._id);
      typingTimeoutRef.current = null;
    }, 3000);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getUserDisplayName = (userObj) => {
    if (!userObj) return '';
    const firstName = userObj?.firstName || userObj?.profile?.firstName || '';
    const lastName = userObj?.lastName || userObj?.profile?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
    return userObj?.username || userObj?.email || '';
  };

  const getConversationTitle = () => {
    if (!conversation?.participants?.length) return 'Chat';

    const otherParticipant = conversation.participants.find((p) => {
      const pid = typeof p?.userId === 'string' ? p.userId : p?.userId?._id;
      return pid && pid !== currentUserId;
    }) || conversation.participants[0];

    const userObj = typeof otherParticipant?.userId === 'object' ? otherParticipant.userId : null;
    const displayName = getUserDisplayName(userObj);
    if (displayName) return displayName;
    return otherParticipant?.role === 'tutor' ? 'Tutor' : 'Student';
  };

  const renderAttachments = (attachments = []) => {
    if (!attachments.length) return null;

    return (
      <div className="flex flex-col gap-2">
        {attachments.map((attachment) => {
          const kind = attachment.kind || (attachment.mimeType?.startsWith('image/') ? 'image' : 'document');
          const url = attachment.url?.startsWith('http') ? attachment.url : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${attachment.url}`;

          if (kind === 'image') {
            return (
              <a key={attachment.url} href={url} target="_blank" rel="noreferrer" className="flex flex-col items-start gap-1">
                <img src={url} alt={attachment.name} className="w-[220px] max-w-full rounded-xl border border-black/10 object-cover" />
                <span className="text-xs opacity-80">{attachment.name}</span>
              </a>
            );
          }

          return (
            <a key={attachment.url} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl bg-black/5 text-inherit">
              <FiFile />
              <div>
                <span className="block text-xs font-gilroyBold">{attachment.name}</span>
                <small className="block text-[11px] opacity-70">{Math.max(1, Math.round((attachment.size || 0) / 1024))} KB</small>
              </div>
            </a>
          );
        })}
      </div>
    );
  };

  if (!conversation || !conversation._id) {
    return (
      <div className="flex-1 bg-white rounded-xl shadow-card border border-neutral-100 flex items-center justify-center p-8 text-center text-neutral-400">
        <p>Select a conversation to start messaging</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 bg-neutral-50 rounded-xl shadow-card border border-neutral-100 flex items-center justify-center p-8 text-center text-neutral-500">
        <p>Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-xl shadow-card border border-neutral-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
        <h3 className="text-lg font-gilroyBold text-neutral-800">{getConversationTitle()}</h3>
        <p className="text-xs text-neutral-400">Active now</p>
      </div>

      {error && <div className="px-5 py-2 bg-danger-50 text-danger-600 text-sm border-b border-danger-200">{error}</div>}

      <div className="flex-1 overflow-y-auto p-5 bg-neutral-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-neutral-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              // Handle both string and object senderId formats
              const senderId = typeof message.senderId === 'string' 
                ? message.senderId 
                : message.senderId?._id;
              const isOwn = senderId === currentUserId;
              const showDate =
                index === 0 ||
                formatDate(messages[index - 1]?.createdAt) !==
                  formatDate(message.createdAt);

              return (
                <div key={message._id || index}>
                  {showDate && (
                    <div className="my-4 text-center text-xs text-neutral-400 before:content-[''] before:inline-block before:w-8 before:h-px before:bg-neutral-300 before:align-middle before:mr-2 after:content-[''] after:inline-block after:w-8 after:h-px after:bg-neutral-300 after:align-middle after:ml-2">
                      {formatDate(message.createdAt)}
                    </div>
                  )}
                  <div className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[72%] px-3.5 py-2.5 rounded-2xl flex flex-col gap-1.5 break-words ${
                        isOwn
                          ? 'bg-primary-500 text-white rounded-br-md'
                          : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-md'
                      }`}
                    >
                        {message.text && message.text !== '[Attachment]' && <p>{message.text || '[Message deleted]'}</p>}
                        {renderAttachments(message.attachments || [])}
                      <span className={`text-[11px] ${isOwn ? 'text-white/80 text-right' : 'text-neutral-400'}`}>
                        {formatTime(message.createdAt)}
                      </span>
                      {isOwn && message.isRead && (
                        <span className="text-[11px] text-white/80">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {typingUsers.size > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-2xl bg-white w-fit">
                <p className="m-0 text-xs text-neutral-500">Someone is typing...</p>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-neutral-300 animate-pulse"></span>
                  <span className="w-2 h-2 rounded-full bg-neutral-300 animate-pulse [animation-delay:120ms]"></span>
                  <span className="w-2 h-2 rounded-full bg-neutral-300 animate-pulse [animation-delay:240ms]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="px-4 py-3 border-t border-neutral-200 bg-white flex items-end gap-2 flex-wrap sm:flex-nowrap relative">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
        />
        <div className="relative flex items-center gap-2" ref={emojiPickerRef}>
          <button
            type="button"
            className="w-9 h-9 rounded-full border border-neutral-200 text-neutral-500 hover:text-primary-500 hover:border-primary-300 hover:bg-primary-50 transition-colors inline-flex items-center justify-center"
            onClick={triggerFilePicker}
            title="Attach files"
          >
            <FiPaperclip />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-full border border-neutral-200 text-neutral-500 hover:text-primary-500 hover:border-primary-300 hover:bg-primary-50 transition-colors inline-flex items-center justify-center"
            onClick={() => setShowEmojiPicker((value) => !value)}
            title="Add emoji"
          >
            <FiSmile />
          </button>
          {showEmojiPicker && (
            <div className="absolute left-0 bottom-12 w-[240px] p-2 border border-neutral-200 rounded-xl bg-white shadow-lg grid grid-cols-6 gap-1 z-20">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="text-lg rounded-md bg-neutral-100 hover:bg-primary-50 px-0 py-1.5 transition-colors"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedFiles.length > 0 && (
          <div className="order-3 sm:order-none w-full sm:w-auto flex flex-wrap gap-2 max-w-full sm:max-w-[260px]">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-xs text-neutral-700">
                {getAttachmentKind(file) === 'image' ? <FiImage /> : <FiFile />}
                <span className="max-w-[130px] truncate">{file.name}</span>
                <button type="button" onClick={() => removeSelectedFile(index)} aria-label="Remove file" className="text-neutral-500 hover:text-danger-600">
                  <FiX />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="text"
          className="flex-1 min-w-0 px-4 py-2.5 border border-neutral-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400"
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
          disabled={loading}
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-full text-sm font-gilroyMedium bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white transition-colors"
          disabled={(!input.trim() && selectedFiles.length === 0) || loading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindowComponent;
