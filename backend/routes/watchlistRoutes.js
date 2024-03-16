import express from 'express';
import { Watchlist } from '../models/stockModel.js';
const router = express.Router();

router.post('/add/', async (request, response) => {
    try {
        if (
            !request.body.name ||
            !request.body.ticker ||
            !request.body.c ||
            !request.body.d ||
            !request.body.dp

        ) {
            return response.status(400).send({
                message: 'Send all required fields: name, ticker, c, d, dp'
            })
        }

        const newStock = {
            name: request.body.name,
            ticker: request.body.ticker,
            c: request.body.c,
            d: request.body.d,
            dp: request.body.dp,
        }
        const stock = await Watchlist.create(newStock);

        return response.status(201).send(stock);
    }
    catch (error) {
        console.log('error.message: ', error.message)
        response.status(500).send({ message: error.message })
    }
})

// get all the stocks
router.get('/get/', async (request, response) => {
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
router.get('/:ticker', async (request, response) => {
    try {
        const { ticker } = request.params;
        const stock = Watchlist.findById(id);

        return response.status(200).json(stock);
    } catch (error) {
        console.log('error.message', error.message);
        response.status(500).send({ message: error.message });
    }
});

// update stock
router.put('/:id', async (request, response) => {
    try {
        if (
            !request.body.name ||
            !request.body.ticker ||
            !request.body.c ||
            !request.body.d ||
            !request.body.dp
        ) {
            return response.status(400).send({
                message: 'Send all required fields: name, ticker'
            })
        }
        const { id } = request.params;
        const result = await Watchlist.findByIdAndUpdate(id, request.body);

        if (!result) {
            return response.status(404).json({ message: 'Stock not found' });
        }
        return response.status(200).send({ message: 'Stock updated successfully' });
    } catch (error) {
        console.log('error.message', error.message);
        response.status(500).send({ message: error.message });
    }
})

// delete stock
router.delete('/:id', async (request, response) => {
    try {

        const { id } = request.params;
        const result = await Watchlist.findByIdAndDelete(id);
        if (!result) {
            return response.status(404).send({
                message: 'Stock not found'
            })
        }
        return response.status(200).send({ message: 'Stock deleted successfully' });
    } catch (error) {
        console.log('error.message', error.message);
        response.status(500).send({ message: error.message });
    }
})

export default router;