const express = require('express');
const router = express.Router();
const { dbGet, dbRun } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    SECRET_KEY,
    SALT_ROUNDS
} = require('../config');
const authenticateToken = require('./authMiddleware');

//-----------------------------------------------------------------------------
// Change password:
// curl -X PUT /api/auth/change-password
// -H "Content-Type: application/json"
// -H "Authorization: Bearer {token}"
// -d '{"oldPassword":"{oldPassword}}", "newPassword":"{newPassword}"}'
//-----------------------------------------------------------------------------

// Register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const userAlreadyExists = await (dbGet('SELECT * FROM users WHERE email = ?', [email]));
        if (userAlreadyExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await dbRun('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ message: 'User already exists' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const user = await (dbGet('SELECT * FROM users WHERE email = ? LIMIT 1', [email]));

        if (!user) 
            return res.status(401).json({ message: 'Invalid email or password'});

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY);

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete user
router.delete('/delete', authenticateToken, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const user = await (dbGet('SELECT * FROM users WHERE id = ? LIMIT 1', [req.user.userId]));

        if (!user) 
            return res.status(401).json({ message: 'Invalid email or password'});

        if (user.email !== email) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const id = user.id;
        await dbRun('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old password and new password are required' });
    }
    try {
        const user = await (dbGet('SELECT * FROM users WHERE id = ? LIMIT 1', [req.user.userId]));
        
        if (!user)
            return res.status(401).json({ message: 'Invalid data' });
        
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await dbRun('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
        return res.status(200).json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//mail
router.get('/mail', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await dbGet('SELECT email FROM users WHERE id = ?', [userId]);

        if (user) {
            res.json({ email: user.email });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;