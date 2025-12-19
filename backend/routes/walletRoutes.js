const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../db');
const authenticateToken = require('./authMiddleware');

// Create empty wallet for user
router.post('/create', authenticateToken, async(req, res) => {
    try {
        const walletAlreadyExists = await (dbGet('SELECT * FROM wallets WHERE user_id = ? LIMIT 1', [req.user.userId]));
        if (walletAlreadyExists) {
            return res.status(400).json({ message: 'Wallet already exists' });
        }
        const wallet = await dbRun('INSERT INTO wallets (user_id) VALUES (?)', [req.user.userId]);
        res.status(201).json({ message: 'Wallet created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get only wallet id and user id. No currency wallets
// TODO: Change 'box' in path
router.get('/id', authenticateToken, async (req, res) => {
    try {
        const wallet = await (dbGet('SELECT * FROM wallets WHERE user_id = ? LIMIT 1', [req.user.userId]));
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }
        res.status(200).json(wallet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all currency wallets for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const wallet = await (dbGet('SELECT * FROM wallets WHERE user_id = ? LIMIT 1', [req.user.userId]));
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }
        
        const currencyWallets = await (dbAll('SELECT * FROM currency_wallets WHERE wallet_id = ?', [wallet.id]));
        if (!currencyWallets) {
            return res.status(404).json({ message: 'Currency wallets not found' });
        }
        res.status(200).json(currencyWallets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create new currency wallet
router.post('/create/:currencyCode', authenticateToken, async (req, res) => {
    try {
        const walletAlreadyExists = await (dbGet('SELECT * FROM wallets WHERE user_id = ? LIMIT 1', [req.user.userId]));
        if (!walletAlreadyExists) {
            return res.status(404).json({ message: 'Wallet not found' });
        }
        
        const allowedCurrency = await dbGet('SELECT * FROM currencies WHERE code = ?', [req.params.currencyCode]);
        if (!allowedCurrency) {
            return res.status(400).json({ message: 'Invalid currency code' });
        }

        const currencyWalletAlreadyExists = await (dbGet('SELECT * FROM currency_wallets WHERE wallet_id = ? AND currency = ? LIMIT 1', [walletAlreadyExists.id, req.params.currencyCode]));
        if (currencyWalletAlreadyExists) {
            return res.status(400).json({ message: 'Currency wallet already exists' });
        }

        const currencyWallet = await dbRun('INSERT INTO currency_wallets (wallet_id, currency) VALUES (?, ?)', [walletAlreadyExists.id, req.params.currencyCode]);
        res.status(201).json({ message: `Currency wallet (${req.params.currencyCode}) created successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// TODO Currency wallet should return money while is shutting down
// Delete currency wallet
router.delete('/delete/:currencyCode', authenticateToken, async (req, res) => {
    try {
        const wallet = await (dbGet('SELECT * FROM wallets WHERE user_id = ? LIMIT 1', [req.user.userId]));
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        const allowedCurrency = await dbGet('SELECT * FROM currencies WHERE code = ?', [req.params.currencyCode]);
        if (!allowedCurrency) {
            return res.status(400).json({ message: 'Invalid currency code' });
        }

        const currencyWallet = await (dbGet('SELECT * FROM currency_wallets WHERE wallet_id = ? AND currency = ? LIMIT 1', [wallet.id, req.params.currencyCode]));
        if (!currencyWallet) {
            return res.status(404).json({ message: 'Currency wallet not found' });
        }
        await dbRun('DELETE FROM currency_wallets WHERE id = ?', [currencyWallet.id]);
        res.status(200).json({ message: `Currency wallet (${req.params.currencyCode}) deleted successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// Delete wallet and all coresponding currency wallets
router.delete('/delete', authenticateToken, async (req, res) => {
    try {
        const wallet = await (dbGet('SELECT * FROM wallets WHERE user_id = ? LIMIT 1', [req.user.userId]));
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }
        try {
            await dbRun('DELETE FROM currency_wallets WHERE wallet_id = ?', [wallet.id]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
        await dbRun('DELETE FROM wallets WHERE id = ?', [wallet.id]);
        res.status(200).json({ message: 'Wallet with all currency wallets deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//Get transaction history
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const wallet = await dbGet('SELECT id FROM wallets WHERE user_id = ? LIMIT 1', [req.user.userId]);
        
        if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

        const query = `
            SELECT * FROM transactions 
            WHERE wallet_id = ? 
            ORDER BY datetime(date) DESC
        `;
        
        const history = await dbAll(query, [wallet.id]);
        
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;