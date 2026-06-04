const express = require('express');

const router = express.Router();

const USERS = {
  animation: {
    password: 'animation2026!',
    role: 'animation',
  },
  // Legacy username — same access as animation
  admin: {
    password: 'animation2026!',
    role: 'animation',
  },
  guestrelation: {
    password: 'guest__2026!!',
    role: 'guestrelation',
  },
};

function decodeToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const username = decoded.split(':')[0];
    return USERS[username] ? username : null;
  } catch {
    return null;
  }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = USERS[username];
    if (user && user.password === password) {
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      res.json({
        success: true,
        token,
        role: user.role,
        username,
        message: 'Login successful',
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

// GET /api/auth/verify
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const username = decodeToken(token);
    if (!username) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      valid: true,
      role: USERS[username].role,
      username,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
