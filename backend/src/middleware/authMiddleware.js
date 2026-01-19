const { auth } = require('../config/firebase');

const extractToken = (authorizationHeader = '') => {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return null;
  }
  return authorizationHeader.substring(7);
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: missing or invalid token' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null
    };

    return next();
  } catch (error) {
    const status = error.code === 'auth/argument-error' ? 400 : 401;
    return res.status(status).json({ message: 'Unauthorized: unable to verify token' });
  }
};

module.exports = authMiddleware;
