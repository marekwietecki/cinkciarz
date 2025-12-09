const { dbGet, dbRun } = require('../db');

async function getWallet(userId) {
    return await dbGet('SELECT * FROM wallets WHERE user_id = ? LIMIT 1', [userId]);
}
async function getCurrencyWallet(walletId, currency) {
    return await dbGet('SELECT * FROM currency_wallets WHERE wallet_id = ? AND currency = ? LIMIT 1', [walletId, currency]);
}
async function depositCurrencyWallet(walletId, currency, amount) {
    let currencyWallet = await getCurrencyWallet(walletId, currency);
    if (!currencyWallet) {
        // Adds new currency wallet and set currencyWallet to it
        await dbRun('INSERT INTO currency_wallets (wallet_id, currency, amount) VALUES (?, ?, ?)', [walletId, currency, 0]);
        currencyWallet = await getCurrencyWallet(walletId, currency);
    }
    const result = await dbRun('UPDATE currency_wallets SET amount = amount + ? WHERE id = ?', [amount, currencyWallet.id]);
    return result;
}
async function withdrawCurrencyWallet(walletId, currency, amount) {
    let currencyWallet = await getCurrencyWallet(walletId, currency);
    if (!currencyWallet || currencyWallet.amount < amount) {
        // Returns error with information that user need to have wallet and enough funds to withdraw
        throw new Error('Not enough funds in wallet');
    }
    const result = await dbRun('UPDATE currency_wallets SET amount = amount - ? WHERE id = ?', [amount, currencyWallet.id]);
    return result;
}
async function exchangeCurrencyWallet(walletId, fromCurrency, fromAmount, toCurrency, toAmount) {
    await dbRun("BEGIN TRANSACTION");
    try {
        let fromCurrencyWallet = await getCurrencyWallet(walletId, fromCurrency);
        let toCurrencyWallet = await getCurrencyWallet(walletId, toCurrency);
        if (!fromCurrencyWallet || fromCurrencyWallet.amount < fromAmount) {
            // Returns error with information that user need to have wallet and enough funds to withdraw
            throw new Error('Not enough funds in source wallet');
        }
        if (!toCurrencyWallet) {
            // Adds new currency wallet and set currencyWallet to it
            await dbRun('INSERT INTO currency_wallets (wallet_id, currency, amount) VALUES (?, ?, ?)', [walletId, toCurrency, 0]);
            toCurrencyWallet = await getCurrencyWallet(walletId, toCurrency);
        }
        
        await dbRun('UPDATE currency_wallets SET amount = amount - ? WHERE id = ?', [fromAmount, fromCurrencyWallet.id]);
        await dbRun('UPDATE currency_wallets SET amount = amount + ? WHERE id = ?', [toAmount, toCurrencyWallet.id]);

        await dbRun("COMMIT");
        
        return { success: true };
    } catch (e) {
        await dbRun("ROLLBACK");
        throw e;
    }
}

module.exports = {
    getWallet,
    getCurrencyWallet,
    depositCurrencyWallet,
    withdrawCurrencyWallet,
    exchangeCurrencyWallet
};