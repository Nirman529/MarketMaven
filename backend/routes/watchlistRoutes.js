import express from 'express';
import { Watchlist } from '../models/stockModel.js';
const router = express.Router();

router.post('/add', async (request, response) => {
    try {
        if (!request.body.ticker) {
            return response.status(400).send({
                message: 'Send all required fields: ticker'
            })
        }

        const newStock = {
            ticker: request.body.ticker,
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