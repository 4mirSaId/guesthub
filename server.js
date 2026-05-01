require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cron = require('node-cron');
const requestRoutes = require('./routes/requests');
const complaintsRoutes = require('./routes/complaints');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const eventsRoutes = require('./routes/events');
const announcementsRoutes = require('./routes/announcements');
const SongRequest = require('./models/SongRequest');
const ServiceRequest = require('./models/ServiceRequest');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/announcement', announcementsRoutes);
app.use('/api/service-requests', require('./routes/serviceRoutes'));

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@<cluster>.mongodb.net/songrequests?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Clean up old requests every 24 hours
cron.schedule('0 0 * * *', async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await SongRequest.deleteMany({ createdAt: { $lt: twentyFourHoursAgo } });
    console.log(`Cleaned up ${result.deletedCount} old song requests`);
  } catch (error) {
    console.error('Error cleaning up requests:', error);
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});