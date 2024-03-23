import mongoose from 'mongoose'

const watchlistSchema = mongoose.Schema(
    {
        ticker: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
        }
    },
    {
        timeStamps: true,
    }
);

export const Watchlist = mongoose.model('watchlist', watchlistSchema);