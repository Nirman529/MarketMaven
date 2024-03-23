import express from 'express';
import { Watchlist } from '../models/stockModel.js';
const router = express.Router();

router.post('/add', async (request, response) => {
    try {
        const { ticker, name } = request.body;
        if (!ticker || !name) {
            return response.status(400).send({
                message: 'Please send all required fields: ticker and name.'
            });
        }

        const newStock = { ticker, name };
        const stock = await Watchlist.create(newStock);

        return response.status(201).send(stock);
    } catch (error) {
        console.error('Error when adding to watchlist: ', error.message);
        if (error.code === 11000) {
            return response.status(409).send({ message: 'Ticker or name already exists in the watchlist.' });
        }
        return response.status(500).send({ message: error.message });
    }
});


// get all the stocks
router.get('/get', async (request, response) => {
    try {
        const stocks = await Watchlist.find({});
        return response.status(200).json(
            {
                count: stocks.length,
                data: stocks
            }
        );
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message })
    }
});

// get a single stock
// might contain some bugs
router.get('/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const stock = Watchlist.findById(id);

        return response.status(200).json(stock);
    } catch (error) {
        console.log('error.message', error.message);
        response.status(500).send({ message: error.message });
    }
});


// delete stock
router.delete('/remove/:ticker', async (request, response) => {
    const { ticker } = request.params;
    try {
        const deletedStock = await Watchlist.findOneAndDelete({ ticker });
        if (!deletedStock) {
            return response.status(404).send({
                message: `Stock with ticker ${ticker} not found`
            });
        }
        response.status(200).send({ message: 'Stock removed from watchlist' });
    } catch (error) {
        console.error('error.message:', error.message);
        response.status(500).send({ message: error.message });
    }
});

export default router;