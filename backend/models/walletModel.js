const mongoose = require('mongoose');

const walletSchema = mongoose.Schema(
    {
        balance: {
            type: Number,
            required: true,
        },
    },
    {
        timeStamps: true,
    }
);

const Wallet = mongoose.model('wallet', walletSchema);
module.exports = { Wallet };