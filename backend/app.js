import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import net from 'net';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import connectDB from './config/db.js';
import Module from './models/Module.js';

import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import resourceManagementRoutes from './routes/resourceManagementRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import googleAuthRoutes from './routes/googleAuthSimple.js';
import noticeRoutes from './routes/noticeRoutes.js';
import noticeRequestRoutes from './routes/noticeRequestRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import yearRoutes from './routes/yearRoutes.js';
import semesterRoutes from './routes/semesterRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

import tutorApplicationRoutes from './routes/tutorApplicationRoutes.js';
import studySessionRoutes from './routes/studySessionRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import tutorNotificationRoutes from './routes/tutorNotificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const allowedOriginFromEnv = process.env.CORS_ORIGIN;
      if (allowedOriginFromEnv && origin === allowedOriginFromEnv) {
        return callback(null, true);
      }
      if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  },
});

const allowedOriginFromEnv = process.env.CORS_ORIGIN;

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });

  // Send message event
  socket.on('send_message', (data) => {
    const { conversationId, message } = data;
    const normalizedMessage = typeof message === 'string'
      ? { text: message }
      : (message || {});

    io.to(`conversation_${conversationId}`).emit('receive_message', {
      conversationId,
      ...normalizedMessage,
      senderId: socket.userId,
      timestamp: new Date(),
    });
  });

  // Typing indicator
  socket.on('typing', (conversationId) => {
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
    });
  });

  // Stop typing indicator
  socket.on('stop_typing', (conversationId) => {
    socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
      userId: socket.userId,
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOriginFromEnv && origin === allowedOriginFromEnv) {
        return callback(null, true);
      }

      if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/management', resourceManagementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/notice-requests', noticeRequestRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/years', yearRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/messages', messageRoutes);

app.use('/api/tutor-applications', tutorApplicationRoutes);
app.use('/api/sessions', studySessionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/tutor-notifications', tutorNotificationRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'UniBridge API running' });
});

const PORT = Number(process.env.PORT) || 5000;

function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();

    tester.once('error', () => {
      resolve(false);
    });

    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port);
  });
}

async function getAvailablePort(startPort, maxOffset = 20) {
  for (let offset = 0; offset <= maxOffset; offset += 1) {
    const candidate = startPort + offset;
    // Try a small port window so repeated local runs can still start.
    // Keep this bounded to avoid jumping to unexpected high ports.
    // eslint-disable-next-line no-await-in-loop
    const available = await checkPortAvailable(candidate);
    if (available) return candidate;
  }

  return startPort;
}

async function start() {
  await connectDB();
  try {
    await Module.syncIndexes();
  } catch (indexError) {
    console.error('Module index sync failed:', indexError.message);
  }

  const listenPort = await getAvailablePort(PORT);
  if (listenPort !== PORT) {
    console.warn(`Port ${PORT} is busy. Starting on port ${listenPort} instead.`);
  }

  server.listen(listenPort, () => console.log(`Server running on port ${listenPort} with Socket.io enabled`));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export { io };
