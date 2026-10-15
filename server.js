require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const complaintsRoutes = require('./routes/complaints');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const announcementsRoutes = require('./routes/announcements');

const allowedOrigins = [
  'http://localhost:3000',
  /*'http://127.0.0.1:3000',
  'https://hotel-guesthub.vercel.app',*/
  process.env.CLIENT_ORIGIN,
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_API_URL,
].filter(Boolean).map((origin) => origin.replace(/\/$/, ''));

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return allowedOrigins.includes(origin.replace(/\/$/, ''));
}

function corsOrigin(origin, callback) {
  if (isAllowedOrigin(origin)) {
    return callback(null, true);
  }
  return callback(new Error('Not allowed by CORS'));
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

// Middleware
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/announcement', announcementsRoutes);
app.use('/api/service-requests', require('./routes/serviceRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/program', require('./routes/program'));
app.use('/api/push', require('./routes/push'));

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb+srv://<username>:<password>@<cluster>.mongodb.net/guesthub?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => {
  console.error('MongoDB connection error:', err.message);
  console.error('Check that your Atlas cluster is running and your IP is allowed in Network Access.');
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
