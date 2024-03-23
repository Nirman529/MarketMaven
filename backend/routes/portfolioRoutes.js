import express from 'express';
import { Portfolio } from '../models/portfolioModel.js';
const router = express.Router();

router.post('/add', async (request, response) => {
    try {
        const { ticker, name, quantity, avgCost, totalCost } = request.body;
        if (!ticker || !name || !quantity || !avgCost || !totalCost) {
            return response.status(400).send({
                message: 'Please send all required fields: ticker, name, quantity, avgCost, totalCost.'
            });
        }

        const newStock = { ticker, name, quantity, avgCost, totalCost };
        const stock = await Portfolio.create(newStock);

        return response.status(201).send(stock);
    } catch (error) {
        console.error('Error when adding to portfolio: ', error.message);
        if (error.code === 11000) {
            return response.status(409).send({ message: 'Ticker or name already exists in the portfolio.' });
        }
        return response.status(500).send({ message: error.message });
    }
});


// get all the stocks
router.get('/get', async (request, response) => {
    try {
        const stocks = await Portfolio.find({});
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
        const stock = Portfolio.findById(id);

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
        const deletedStock = await Portfolio.findOneAndDelete({ ticker });
        if (!deletedStock) {
            return response.status(404).send({
                message: `Stock with ticker ${ticker} not found`
            });
        }
        response.status(200).send({ message: 'Stock removed from portfolio' });
    } catch (error) {
        console.error('error.message:', error.message);
        response.status(500).send({ message: error.message });
    }
});

export default router;