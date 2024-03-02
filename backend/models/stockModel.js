import mongoose from 'mongoose'

const stockSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        ticker: {
            type: String,
            required: true
        },
    },
    {
        timeStamp: true,
    }
);

export const Stock = mongoose.model('stock', stockSchema);