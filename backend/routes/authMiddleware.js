const jwt = require('jsonwebtoken');
const {
    SECRET_KEY,
} = require('../config');

function authenticateToken(req, res, next) {
    const authHeader = req.headers && req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized request' });
    }

    try {
        const payload = jwt.verify(token, SECRET_KEY);
        req.user = payload;
        return next();
    } catch (e) {
        return res.status(403).json({ message: 'Invalid token' });
    }
}

module.exports = authenticateToken;