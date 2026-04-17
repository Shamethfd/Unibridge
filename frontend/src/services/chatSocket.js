import io from 'socket.io-client';
import config from '../config/config';

let socket = null;
let listeners = {};

export const initSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(config.API_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket.io connected:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error);
  });

  socket.on('disconnect', () => {
    console.log('Socket.io disconnected');
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

// Join a conversation room
export const joinConversation = (conversationId) => {
  if (socket) {
    socket.emit('join_conversation', conversationId);
  }
};

// Leave a conversation room
export const leaveConversation = (conversationId) => {
  if (socket) {
    socket.emit('leave_conversation', conversationId);
  }
};

// Send a message via socket
export const sendMessage = (conversationId, message) => {
  if (socket) {
    socket.emit('send_message', { conversationId, message });
  }
};

// Listen for incoming messages
export const onReceiveMessage = (callback) => {
  if (socket) {
    socket.on('receive_message', callback);
  }
};

// Remove receive message listener
export const offReceiveMessage = () => {
  if (socket) {
    socket.off('receive_message');
  }
};

// Listen for typing indicator
export const onUserTyping = (callback) => {
  if (socket) {
    socket.on('user_typing', callback);
  }
};

// Remove typing listener
export const offUserTyping = () => {
  if (socket) {
    socket.off('user_typing');
  }
};

// Listen for stop typing indicator
export const onUserStopTyping = (callback) => {
  if (socket) {
    socket.on('user_stop_typing', callback);
  }
};

// Remove stop typing listener
export const offUserStopTyping = () => {
  if (socket) {
    socket.off('user_stop_typing');
  }
};

// Emit typing indicator
export const emitTyping = (conversationId) => {
  if (socket) {
    socket.emit('typing', conversationId);
  }
};

// Emit stop typing indicator
export const emitStopTyping = (conversationId) => {
  if (socket) {
    socket.emit('stop_typing', conversationId);
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
