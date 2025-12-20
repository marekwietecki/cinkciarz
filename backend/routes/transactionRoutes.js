const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../db');
const authenticateToken = require('./authMiddleware');
const { checkCurrencyExists } = require('../services/currencyServices');
const { getWallet, depositCurrencyWallet, withdrawCurrencyWallet, exchangeCurrencyWallet } = require('../services/walletServices');
const { checkUserExists } = require('../services/authServices');

async function addTransaction(walletId, type, from_currency = null, to_currency = null, from_amount = null, to_amount = null, rate = null, date = null) {
    switch (type) {
        case 'deposit':
            try {
                if (!walletId || !!from_currency || !to_currency || !!from_amount || !to_amount || to_amount <= 0 || !!rate) { 
                    throw new Error('Invalid transaction data');
                }
                // checks if date is in right format
                if (date && !checkISOSQLiteFormat(date)) {
                    throw new Error('Invalid date format');
                }
                await dbRun(`INSERT INTO transactions
                    (wallet_id, type, from_currency, to_currency, from_amount, to_amount, rate, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [walletId, 'deposit', null, to_currency, null, to_amount, null, date]);
            } catch (e) {
                throw e;
            }
            break;
        case 'withdraw':
            if (!walletId || !from_currency || to_currency !== null || !from_amount || to_amount !== null || from_amount <= 0 || rate !== null) { 
                    throw new Error('Invalid transaction data');
            }
            // checks if date is in right format
            if (date && !checkISOSQLiteFormat(date)) {
                throw new Error('Invalid date format');
            }
            await dbRun(`INSERT INTO transactions
                (wallet_id, type, from_currency, to_currency, from_amount, to_amount, rate, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [walletId, 'withdraw', from_currency, null, from_amount, null, null, date]);
            break;
        case 'exchange':
            if (!walletId || !from_currency || !to_currency || !from_amount || !to_amount || from_amount <= 0 || to_amount <= 0 || !rate) { 
                    throw new Error('Invalid transaction data');
            }
            // checks if date is in right format
            if (date && !checkISOSQLiteFormat(date)) {
                throw new Error('Invalid date format');
            }
            await dbRun(`INSERT INTO transactions
                (wallet_id, type, from_currency, to_currency, from_amount, to_amount, rate, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [walletId, 'exchange', from_currency, to_currency, from_amount, to_amount, rate, date]);
            break;
        default:
            throw new Error('Invalid transaction type');
    }
}


router.post('/deposit', authenticateToken, async (req, res) => {
    try {
        const amount = req.body.amount;
        const currency = req.body.currency || req.body.currencyCode;
        const userId = req.user.userId;
        
        if (!amount || !currency || amount <= 0) {
            return res.status(400).json({ message: 'Amount and currency are required. Amount must be greater than 0' });
        }
        
        const userExist = await checkUserExists(userId); 
        if (!userExist) {
            return res.status(404).json({ message: 'User not found' });
        }
        const currencyExist = await checkCurrencyExists(currency); 
        if (!currencyExist) {
            return res.status(404).json({ message: 'Currency not found' });
        }

        const wallet = await getWallet(req.user.userId);
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        const deposit = await depositCurrencyWallet(wallet.id, currency, amount);
        if (!deposit || deposit.changes === 0) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        await addTransaction(wallet.id, 'deposit', null, req.body.currency, null, req.body.amount, null, getISOSQLiteDate());
        res.status(200).json({ message: 'Deposit successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/withdraw', authenticateToken, async (req, res) => {
    try {
        const amount = req.body.amount;
        const currency = req.body.currency || req.body.currencyCode;
        const userId = req.user.userId;
        
        if (!amount || !currency || amount <= 0) {
            return res.status(400).json({ message: 'Amount and currency are required. Amount must be greater than 0' });
        }
        
        const userExist = await checkUserExists(userId); 
        if (!userExist) {
            return res.status(404).json({ message: 'User not found' });
        }
        const currencyExist = await checkCurrencyExists(currency); 
        if (!currencyExist) {
            return res.status(404).json({ message: 'Currency not found' });
        }

        const wallet = await getWallet(req.user.userId);
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        const withdraw = await withdrawCurrencyWallet(wallet.id, currency, amount);
        if (!withdraw || withdraw.changes === 0) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        await addTransaction(wallet.id, 'withdraw', currency, null, amount, null, null, getISOSQLiteDate());
        res.status(200).json({ message: 'Withdraw successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/exchange', authenticateToken, async (req, res) => {
    try {
        const fromCurrency = req.body.fromCurrency || req.body.fromCurrencyCode;
        const fromAmount = req.body.fromAmount;
        const toCurrency = req.body.toCurrency || req.body.toCurrencyCode;
        const toAmount = req.body.toAmount;
        const rate = req.body.rate;
        const userId = req.user.userId;
        
        if (!fromCurrency || !fromAmount || !toCurrency || !toAmount || !rate || fromAmount <= 0 || toAmount <= 0 || rate <= 0) {
            return res.status(400).json({ message: 'Currencies, amounts and rate are required. Amounts and rate must be greater than 0' });
        }
        
        const userExist = await checkUserExists(userId); 
        if (!userExist) {
            return res.status(404).json({ message: 'User not found' });
        }
        const fromCurrencyExist = await checkCurrencyExists(fromCurrency);
        const toCurrencyExist = await checkCurrencyExists(toCurrency);
        if (!fromCurrencyExist || !toCurrencyExist) {
            return res.status(404).json({ message: 'Currencies not found' });
        }

        const wallet = await getWallet(req.user.userId);
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        const exchange = await exchangeCurrencyWallet(wallet.id, fromCurrency, fromAmount, toCurrency, toAmount);
        if (!exchange) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        await addTransaction(wallet.id, 'exchange', fromCurrency, toCurrency, fromAmount, toAmount, rate, getISOSQLiteDate());
        res.status(200).json({ message: 'Exchange successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

function checkISOSQLiteFormat(date) {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/;
    return regex.test(date);
}
function getISOSQLiteDate(date = null) {
    date === null ? date = new Date() : date = new Date(date);
    return date.toISOString().slice(0, -1);
}
function compareDates(date1, date2) {
    date1 = new Date(date1);
    date2 = new Date(date2);
    return date1.getTime() - date2.getTime();
}

async function getTransactionsHistory(walletId, startDate = null, endDate = null, limit = null, currencyCode = null, orderBy = null) {
    if (!walletId) return null;
    
    if (limit === null) limit = 10;
    if (limit === 'all') limit = null;
    
    if (orderBy && orderBy.toLowerCase() === 'asc' ) orderBy = 'ASC';
    if (orderBy === null || orderBy.toLowerCase() === 'desc') orderBy = 'DESC';
    

    let query = `SELECT * FROM transactions WHERE wallet_id = ?`;
    const queryParams = [walletId];
    
    startDate = startDate ? getISOSQLiteDate(startDate) : null;
    endDate = endDate ? getISOSQLiteDate(endDate) : null;
    if (startDate && startDate !== null) {
        queryParams.push(startDate);
        query += ' AND date >= ?';
    }
    if (endDate && endDate !== null) {
        queryParams.push(endDate);
        query += ' AND date <= ?';
    }
    
    // Add currency filter for both from_currency and to_currency
    if (currencyCode) {
        queryParams.push(currencyCode, currencyCode);
        query += ' AND (from_currency = ? OR to_currency = ?)';
    }

    query += ' ORDER BY date ' + orderBy;

    if (limit !== null) {
        query += ' LIMIT ?';
        queryParams.push(limit);
    }

    try {
        return await dbAll(query, queryParams);
    } catch (error) {
        console.error(error);
        return null;
    }
}


router.get('/history', authenticateToken, async (req, res) => {
    try {
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        const { limit, code, currency, currencyCode, order } = req.query;
        const userId = req.user.userId;
        
        
        const fixedCurrencyCode = code || currencyCode || currency || null;
        if (fixedCurrencyCode) {
            const fixedCurrencyCodeExist = await checkCurrencyExists(fixedCurrencyCode);
            if (!fixedCurrencyCodeExist) {
                return res.status(404).json({ message: 'Currency not found' });
            }
        }

        const userExist = await checkUserExists(userId); 
        if (!userExist) {
            return res.status(404).json({ message: 'User not found' });
        }

        const wallet = await getWallet(req.user.userId);
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        if (startDate && endDate) {
            if (compareDates(startDate, endDate) > 0) {
                const tempDate = startDate;
                startDate = endDate;
                endDate = tempDate;
            }
        }

        const history = await getTransactionsHistory(wallet.id, startDate, endDate, limit, fixedCurrencyCode, order);
        if (!history) {
            return res.status(404).json({ message: 'Transactions not found' });
        }
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;