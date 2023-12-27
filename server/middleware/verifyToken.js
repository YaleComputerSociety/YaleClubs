const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  const authorizationHeader = req.headers['authorization'];

  const token = authorizationHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded.userId);
    const userId = decoded.userId; 

    const user = await User.findOne({ userId });

    if (!user) {
      // Invalid or Expired Token
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Provide User
    req.userId = userId;
    req.user = user;

    return next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};