import mongoose from 'mongoose'

const watchlistSchema = mongoose.Schema(
    {
        ticker: {
            type: String,
            required: true
        },
    },
    {
        timeStamp: true,
    }
);

export const Watchlist = mongoose.model('watchlist', watchlistSchema);