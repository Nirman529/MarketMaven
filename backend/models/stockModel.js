import mongoose from 'mongoose'

const watchlistSchema = mongoose.Schema(
    {
        ticker: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        c: {
            type: Number,
            required: true
        },
        d: {
            type: Number,
            required: true
        },
        dp: {
            type: Number,
            required: true
        },
    },
    {
        timeStamp: true,
    }
);

export const Watchlist = mongoose.model('watchlist', watchlistSchema);