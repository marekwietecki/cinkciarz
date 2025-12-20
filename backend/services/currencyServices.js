const { dbGet } = require('../db');

async function checkCurrencyExists(code) {
    const row = await dbGet('SELECT * FROM currencies WHERE code = ?', [code]);
    return !!row;
}

module.exports = { 
    checkCurrencyExists
};