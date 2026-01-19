const { auth } = require('../config/firebase');

const getProfile = async (req, res, next) => {
  try {
    const userRecord = await auth.getUser(req.user.uid);
    return res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      phoneNumber: userRecord.phoneNumber,
      emailVerified: userRecord.emailVerified,
      metadata: userRecord.metadata
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProfile
};
