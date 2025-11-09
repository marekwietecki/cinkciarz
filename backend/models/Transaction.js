class Transaction {
    constructor(id, userId, type, currency, amount, rate, date = new Date()) {
        this.id = id;
        this.userId = userId;
        this.type = type;// 'BUY' 'SELL' 'DEPOSIT'
        this.currency = currency;
        this.amount = amount;
        this.rate = rate;
        this.date = date;
    }
    getTotalValue() {
        return this.amount * this.rate;
    }
}

module.exports = Transaction;