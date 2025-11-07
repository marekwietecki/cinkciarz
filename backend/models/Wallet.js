class Wallet {
    constructor(walletId, userId) {
        this.walletId = walletId;
        this.userId = userId;
        this.currencies = {};
    }

    addCurrency(currencyCode, amount) {
        if (!this.currencies[currencyCode]) this.currencies[currencyCode] = 0;
        this.currencies[currencyCode] += amount;
    }

    subtractCurrency(currencyCode, amount) {
        if (!this.currencies[currencyCode] || this.currencies[currencyCode] < amount)
            throw new Error('Not enough funds in wallet');
        this.currencies[currencyCode] -= amount;
    }

    getBalance(currencyCode) {
        return this.currencies[currencyCode] || 0;
    }
    getAllBalances() {
        return this.currencies;
    }
}

module.exports = Wallet;
