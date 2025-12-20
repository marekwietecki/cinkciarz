const { dbGet } = require('../db');

async function checkUserExists(userId) {
    const row = await dbGet('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    return !!row;
}

module.exports = {
    checkUserExists
}