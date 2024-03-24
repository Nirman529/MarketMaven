import { PORT, mongoDBURL } from './config.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import watchlistRoutes from './routes/watchlistRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import portfolioRoutes from './routes/portfolioRoutes.js'

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (request, response) => {
    console.log(request);
    return response.status(234).send('Hello World!');
});

app.use('/portfolio', portfolioRoutes);
app.use('/watchlist', watchlistRoutes);
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
