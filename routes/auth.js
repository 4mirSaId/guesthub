const express = require('express');

const router = express.Router();

// Mock admin credentials (in production, use proper user database)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'dj2026!amir';

// POST /api/auth/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // In production, use JWT or sessions
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      res.json({ 
        success: true, 
        token,
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout - Admin logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

// GET /api/auth/verify - Verify token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // In production, verify JWT properly
    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
