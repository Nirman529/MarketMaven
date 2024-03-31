const mongoose = require('mongoose');

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

const Watchlist = mongoose.model('watchlist', watchlistSchema);
module.exports.Watchlist = Watchlist;