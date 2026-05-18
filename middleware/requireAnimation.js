const USERS = {
  animation: true,
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

function requireAnimation(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !decodeToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

module.exports = requireAnimation;
