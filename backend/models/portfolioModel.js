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
            type: Number,
            required: true
        },
        totalCost: {
            type: Number,
            required: true
        },
    },
    {
        timeStamp: true,
    }
);

export const Portfolio = mongoose.model('portfolio', portfolioSchema);