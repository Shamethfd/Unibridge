import React, { useState, useEffect, useRef } from 'react';
import {
  getConversationMessages,
  sendChatMessage,
  markMessagesAsRead,
  deleteChatMessage,
  deleteConversation,
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
import { FiPaperclip, FiSmile, FiX, FiImage, FiFile, FiTrash2, FiSend } from 'react-icons/fi';

const EMOJIS = ['😀', '😂', '😍', '🥰', '👍', '🙏', '🔥', '🎉', '💯', '😊', '😎', '🤝'];

const ChatWindowComponent = ({ conversation, onConversationDeleted }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deletingConversation, setDeletingConversation] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

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

  useEffect(() => {
    if (!conversation || !conversation._id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        await loadMessages();
        await markMessagesAsRead(conversation._id);
        joinConversation(conversation._id);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const handleReceiveMessage = (data) => {
      if (data.conversationId === conversation._id) {
        setMessages((prev) => {
          if (data._id && prev.some((m) => String(m._id) === String(data._id))) return prev;
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
      if (userId !== currentUserId) setTypingUsers((prev) => new Set([...prev, userId]));
    };
    const handleUserStopTyping = ({ userId }) => {
      setTypingUsers((prev) => { const s = new Set(prev); s.delete(userId); return s; });
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

  const removeSelectedFile = (index) => setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  const triggerFilePicker = () => fileInputRef.current?.click();
  const insertEmoji = (emoji) => { setInput((prev) => `${prev}${emoji}`); setShowEmojiPicker(false); };
  const getAttachmentKind = (file) => (file.type?.startsWith('image/') ? 'image' : 'document');
  const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && selectedFiles.length === 0) return;
    const messageText = input.trim();
    setInput('');
    emitStopTyping(conversation._id);
    try {
      const response = await sendChatMessage(conversation._id, messageText, selectedFiles);
      setMessages((prev) => [...prev, { ...response.data, senderId: response.data.senderId }]);
      setSelectedFiles([]);
      setShowEmojiPicker(false);
      scrollToBottom();
      sendMessage(conversation._id, response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setInput(messageText);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!typingTimeoutRef.current) emitTyping(conversation._id);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(conversation._id);
      typingTimeoutRef.current = null;
    }, 3000);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId || !window.confirm('Delete this message?')) return;
    try {
      await deleteChatMessage(messageId);
      setMessages((prev) =>
        prev.map((m) => String(m._id) === String(messageId) ? { ...m, text: '[Message deleted]', attachments: [] } : m)
      );
    } catch (err) { setError(getApiErrorMessage(err)); }
  };

  const handleDeleteConversation = async () => {
    if (!conversation?._id || deletingConversation) return;
    if (!window.confirm('Delete this conversation? This will hide it from your chat list.')) return;
    try {
      setDeletingConversation(true);
      await deleteConversation(conversation._id);
      setMessages([]);
      onConversationDeleted?.(conversation._id);
    } catch (err) { setError(getApiErrorMessage(err)); }
    finally { setDeletingConversation(false); }
  };

  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString() : '';

  const getUserDisplayName = (u) => {
    if (!u) return '';
    const name = `${u?.firstName || u?.profile?.firstName || ''} ${u?.lastName || u?.profile?.lastName || ''}`.trim();
    return name || u?.username || u?.email || '';
  };

  const getConversationTitle = () => {
    if (!conversation?.participants?.length) return 'Chat';
    const other = conversation.participants.find((p) => {
      const pid = typeof p?.userId === 'string' ? p.userId : p?.userId?._id;
      return pid && pid !== currentUserId;
    }) || conversation.participants[0];
    const userObj = typeof other?.userId === 'object' ? other.userId : null;
    const name = getUserDisplayName(userObj);
    return name || (other?.role === 'tutor' ? 'Tutor' : 'Student');
  };

  const getInitials = (name) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const renderAttachments = (attachments = []) => {
    if (!attachments.length) return null;
    return (
      <div className="flex flex-col gap-2 mt-1">
        {attachments.map((att) => {
          const kind = att.kind || (att.mimeType?.startsWith('image/') ? 'image' : 'document');
          const url = att.url?.startsWith('http') ? att.url : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${att.url}`;
          if (kind === 'image') {
            return (
              <a key={att.url} href={url} target="_blank" rel="noreferrer" className="block">
                <img src={url} alt={att.name} className="w-52 max-w-full rounded-xl border border-black/10 object-cover shadow-sm" />
                <span className="mt-1 block text-[11px] opacity-70">{att.name}</span>
              </a>
            );
          }
          return (
            <a key={att.url} href={url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2.5 rounded-xl bg-black/10 p-2.5 text-inherit hover:bg-black/15 transition-colors">
              <FiFile className="shrink-0" />
              <div className="min-w-0">
                <span className="block truncate text-xs font-semibold">{att.name}</span>
                <small className="block text-[11px] opacity-70">{Math.max(1, Math.round((att.size || 0) / 1024))} KB</small>
              </div>
            </a>
          );
        })}
      </div>
    );
  };

  /* ── No conversation selected ── */
  if (!conversation || !conversation._id) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg shadow-blue-100"
          style={{ background: 'linear-gradient(135deg, #094886, #2563eb)' }}>
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-700">Select a conversation</p>
          <p className="mt-1 text-xs text-slate-400">Choose a chat from the list to start messaging.</p>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200"
          style={{ borderTopColor: '#2563eb' }} />
        <p className="text-xs text-slate-400">Loading conversation…</p>
      </div>
    );
  }

  const title = getConversationTitle();

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">

      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5"
        style={{ background: 'linear-gradient(90deg, #094886 0%, #1a5fa0 60%, #2563eb 100%)' }}>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white ring-2 ring-white/30 backdrop-blur-sm">
            {getInitials(title)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-none">{title}</h3>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[11px] text-blue-100/80">Active now</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDeleteConversation}
          disabled={deletingConversation}
          className="flex items-center gap-1.5 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-1.5 text-[11px] font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiTrash2 size={12} />
          {deletingConversation ? 'Deleting…' : 'Delete chat'}
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex shrink-0 items-center gap-2 border-b border-rose-200 bg-rose-50 px-5 py-2.5 text-xs text-rose-700">
          <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
          <button onClick={() => setError('')} className="ml-auto text-rose-400 hover:text-rose-600"><FiX size={12} /></button>
        </div>
      )}

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1"
        style={{ background: 'radial-gradient(ellipse at top, #eff6ff 0%, #f8fafc 100%)' }}>

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <svg className="h-6 w-6 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-400">No messages yet</p>
            <p className="text-xs text-slate-300">Be the first to say something!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const senderId = typeof message.senderId === 'string' ? message.senderId : message.senderId?._id;
              const isOwn = senderId === currentUserId;
              const showDate = index === 0 || formatDate(messages[index - 1]?.createdAt) !== formatDate(message.createdAt);
              const isDeleted = message.text === '[Message deleted]';

              return (
                <div key={message._id || index}>
                  {/* Date divider */}
                  {showDate && (
                    <div className="my-5 flex items-center gap-3">
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-400 shadow-sm">
                        {formatDate(message.createdAt)}
                      </span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                  )}

                  <div className={`group flex items-end gap-2 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {/* Other user avatar */}
                    {!isOwn && (
                      <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #094886, #2563eb)' }}>
                        {getInitials(title)}
                      </div>
                    )}

                    <div className={`relative max-w-[75%] sm:max-w-[65%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div
                        className={`relative px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                          isOwn
                            ? 'rounded-2xl rounded-br-sm text-white'
                            : 'rounded-2xl rounded-bl-sm border border-slate-200 bg-white text-slate-800'
                        } ${isDeleted ? 'opacity-60 italic' : ''}`}
                        style={isOwn ? { background: 'linear-gradient(135deg, #094886, #2563eb)' } : {}}
                      >
                        {message.text && message.text !== '[Attachment]' && (
                          <p className="break-words">{message.text}</p>
                        )}
                        {renderAttachments(message.attachments || [])}

                        {/* Timestamp + read receipt */}
                        <div className={`mt-1 flex items-center gap-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-[10px] ${isOwn ? 'text-white/60' : 'text-slate-400'}`}>
                            {formatTime(message.createdAt)}
                          </span>
                          {isOwn && message.isRead && (
                            <span className="text-[10px] text-white/70">✓✓</span>
                          )}
                        </div>
                      </div>

                      {/* Delete button — appears on hover */}
                      {isOwn && !isDeleted && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(message._id)}
                          className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-medium text-slate-400 opacity-0 transition-all hover:text-rose-500 group-hover:opacity-100"
                        >
                          <FiTrash2 size={10} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #094886, #2563eb)' }}>
                  {getInitials(title)}
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2 w-2 rounded-full bg-slate-300 animate-bounce"
                      style={{ animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ── Selected files preview ── */}
      {selectedFiles.length > 0 && (
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-slate-100 bg-slate-50 px-4 py-2.5">
          {selectedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-slate-700">
              {getAttachmentKind(file) === 'image'
                ? <FiImage className="shrink-0 text-blue-500" size={12} />
                : <FiFile className="shrink-0 text-blue-500" size={12} />}
              <span className="max-w-[120px] truncate font-medium">{file.name}</span>
              <button type="button" onClick={() => removeSelectedFile(index)}
                className="ml-0.5 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                <FiX size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <form
        onSubmit={handleSendMessage}
        className="relative flex shrink-0 items-end gap-2 border-t border-slate-100 bg-white px-4 py-3"
      >
        <input ref={fileInputRef} type="file" className="hidden" multiple
          accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} />

        {/* Attach + Emoji */}
        <div className="flex items-center gap-1.5" ref={emojiPickerRef}>
          <button type="button" onClick={triggerFilePicker} title="Attach files"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#2563eb]">
            <FiPaperclip size={15} />
          </button>
          <button type="button" onClick={() => setShowEmojiPicker((v) => !v)} title="Add emoji"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#2563eb]">
            <FiSmile size={15} />
          </button>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-30 grid w-56 grid-cols-6 gap-1 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl shadow-slate-200/60">
              <div className="col-span-6 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
                Reactions
              </div>
              {EMOJIS.map((emoji) => (
                <button key={emoji} type="button" onClick={() => insertEmoji(emoji)}
                  className="flex items-center justify-center rounded-lg py-1.5 text-lg transition hover:bg-blue-50 hover:scale-110">
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text input */}
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          disabled={loading}
          placeholder="Type a message…"
          className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-3 focus:ring-[#2563eb]/15 disabled:opacity-50"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={(!input.trim() && selectedFiles.length === 0) || loading}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md shadow-blue-200 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          style={{ background: 'linear-gradient(135deg, #094886, #2563eb)' }}
        >
          <FiSend size={15} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindowComponent;