class User {
    constructor(userId, email, passwordHash) {
    this.userId = userId;
    this.email = email;
    this.passwordHash = passwordHash;
    }
    attachWallet(walletId) {
        this.walletId = walletId;
    }
    // register();
    // login();
    // logout();
    // getDetails();
}

module.exports = User;
