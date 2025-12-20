const express = require('express');
const router = express.Router();
const { dbGet, dbAll } = require('../db');

router.get('/', async (req, res) => {
    try {
        const currencies = await dbAll('SELECT * FROM currencies');
        res.status(200).json(currencies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:currencyCode', async (req, res) => {
    try {
        const currency = await dbGet('SELECT * FROM currencies WHERE code = ?', [req.params.currencyCode]);
        if (!currency) {
            return res.status(404).json({ message: 'Currency not found' });
        }
        res.status(200).json(currency);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;