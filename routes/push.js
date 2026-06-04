const express = require('express');
const PushSubscription = require('../models/PushSubscription');
const { getPublicVapidKey } = require('../lib/pushNotifications');

const router = express.Router();

const USERS = {
  animation: { role: 'animation' },
  admin: { role: 'animation' },
  guestrelation: { role: 'guestrelation' },
};

function decodeToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const username = decoded.split(':')[0];
    if (!USERS[username]) return null;
    return { username, role: USERS[username].role };
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const user = decodeToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
}

router.get('/vapid-public-key', (req, res) => {
  const publicKey = getPublicVapidKey();
  if (!publicKey) {
    return res.status(503).json({ error: 'Push notifications not configured' });
  }
  res.json({ publicKey });
});

router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { subscription } = req.body;

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return res.status(400).json({ error: 'Invalid subscription payload' });
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        role: req.user.role,
        username: req.user.username,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        userAgent: req.headers['user-agent'] || '',
      },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/unsubscribe', requireAuth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint required' });
    }

    await PushSubscription.deleteOne({ endpoint, role: req.user.role });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
