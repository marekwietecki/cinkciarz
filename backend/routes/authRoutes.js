const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    SECRET_KEY,
    SALT_ROUNDS
} = require('../config');
const authenticateToken = require('./authMiddleware');

function dbGet(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (error, row) => {
            if (error) reject(error);
            else resolve(row);
        });
    });
}

router.get('/', (req, res) => {
    // await db.get('SELECT * FROM users WHERE email = ?', [email])
    db.get('SELECT * FROM users where email = ?', ['ola@ola.ola'], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.status(200).json(rows);
    });
});

// Register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const userAlreadyExists = await (dbGet('SELECT * FROM users WHERE email = ?', [email]));
        if (userAlreadyExists) {
            console.log(userAlreadyExists);
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
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
router.delete('/delete', async (req, res) => {
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
        const id = user.id;
        await db.run('DELETE FROM users WHERE id = ?', [id]);
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

        await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
        return res.status(200).json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;