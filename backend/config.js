const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT: process.env.PORT || 4000,
    SECRET_KEY: process.env.SECRET_KEY || "SECRET_KEY",
    SALT_ROUNDS: Number(process.env.SALT_ROUNDS) || 10,
}