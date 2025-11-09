const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'secret_key';
const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;

// Register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
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
})

module.exports = router;