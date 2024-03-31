require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const watchlistRoutes = require('./routes/watchlistRoutes.js');
const apiRoutes = require('./routes/apiRoutes.js');
const portfolioRoutes = require('./routes/portfolioRoutes.js');
const walletRoutes = require('./routes/walletRoutes.js');

const PORT = process.env.PORT || 8080;
const mongoDBURL = "mongodb+srv://nirmanmalaviya529:XeAxDzhxdawRVo6f@stock-market-proj3.7qgjnfv.mongodb.net/?retryWrites=true&w=majority&appName=stock-market-proj3"

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (request, response) => {
    console.log(request);
    return response.status(234).send('Hello World!');
});

app.use('/portfolio', portfolioRoutes);
app.use('/watchlist', watchlistRoutes);
app.use('/wallet', walletRoutes);
app.use('/api', apiRoutes);

mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log('App connected to the database')
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error)
    })
