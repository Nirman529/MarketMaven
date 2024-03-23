import mongoose from 'mongoose'

const portfolioSchema = mongoose.Schema(
    {
        ticker: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        avgCost: {
            type: Number
        },
        totalCost: {
            type: Number
        },
    },
    {
        timeStamp: true,
    }
);

export const Portfolio = mongoose.model('portfolio', portfolioSchema);