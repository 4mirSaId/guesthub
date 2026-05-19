const USERS = {
  animation: {
    role: 'animation',
  },
  admin: {
    role: 'animation',
  },
};

function decodeToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const username = decoded.split(':')[0];
    return USERS[username] ? { username, role: USERS[username].role } : null;
  } catch {
    return null;
  }
}

function requireAnimation(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = token ? decodeToken(token) : null;

  if (!user || user.role !== 'animation') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = user;
  next();
}

module.exports = requireAnimation;
