import mongoose from 'mongoose'

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

export const Wallet = mongoose.model('wallet', walletSchema);