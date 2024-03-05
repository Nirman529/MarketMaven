import express from 'express';
import { Stock } from '../models/stockModel.js';
const router = express.Router();
router.post('/', async (request, response) => {
    try {
        if (
            !request.body.name ||
            !request.body.ticker
        ) {
            return response.status(400).send({
                message: 'Send all required fields: name, ticker'
            })
        }

        const newStock = {
            name: request.body.name,
            ticker: request.body.ticker
        }
        const stock = await Stock.create(newStock);

        return response.status(201).send(stock);
    }
    catch (error) {
        console.log('error.message: ', error.message)
        response.status(500).send({ message: error.message })
    }
})

// get all the stocks
router.get('/', async (request, response) => {
    try {
        const stocks = await Stock.find({});
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
        const stock = Stock.findById(id);

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
            !request.body.ticker
        ) {
            return response.status(400).send({
                message: 'Send all required fields: name, ticker'
            })
        }
        const { id } = request.params;
        const result = await Stock.findByIdAndUpdate(id, request.body);

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
        const result = await Stock.findByIdAndDelete(id);
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