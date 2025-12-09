const express = require('express');
const app = express();

// Middleware
app.use(express.json());


// Routes
const authRoutes = require('./routes/authRoutes');
const nbpRoutes = require('./routes/nbpRoutes');
const walletRoutes = require('./routes/walletRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const currencyRoutes = require('./routes/currencyRoutes');

// Ping route
app.get('/api/ping', (req, res) => {
    res.status(200).json({ message: 'Pong' });
});

app.use('/api/auth', authRoutes);
app.use('/api/nbp', nbpRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/currency', currencyRoutes);

module.exports = app;