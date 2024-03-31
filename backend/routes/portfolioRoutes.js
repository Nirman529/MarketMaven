const express = require('express');
const { Portfolio } = require('../models/portfolioModel.js');
const router = express.Router();

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
        console.error("Error fetching portfolio data:", error);
        response.status(500).send({ message: "An error occurred while fetching the portfolio data." });
    }
});

router.post('/update/buy/:ticker', async (request, response) => {
    const { ticker } = request.params;
    const { name, quantity, purchasePrice } = request.body;
    try {
        let stock = await Portfolio.findOne({ ticker: ticker.toUpperCase() });
        if (stock) {
            const newTotalQuantity = stock.quantity + quantity;
            stock.totalCost += purchasePrice * quantity;
            stock.avgCost = stock.totalCost / newTotalQuantity;
            stock.quantity = newTotalQuantity;

            await stock.save();
            response.status(200).send(stock);
        } else {
            const totalCost = purchasePrice * quantity;
            const newStock = new Portfolio({
                ticker: ticker.toUpperCase(),
                name: name,
                quantity: quantity,
                avgCost: purchasePrice,
                totalCost: totalCost
            });
            await newStock.save();
            response.status(201).send(newStock);
        }
    } catch (error) {
        console.error('Error when buying stock: ', error.message);
        response.status(500).send({ message: error.message });
    }
});

router.post('/update/sell/:ticker', async (request, response) => {
    const { ticker } = request.params;
    const { quantity, sellPrice } = request.body;
    try {
        let stock = await Portfolio.findOne({ ticker: ticker.toUpperCase() });
        if (stock) {
            if (quantity > stock.quantity) {
                return response.status(400).send({ message: "Sell quantity is greater than the available stock." });
            }
            const newTotalQuantity = stock.quantity - quantity;
            if (newTotalQuantity === 0) {
                await Portfolio.findOneAndDelete({ ticker: ticker.toUpperCase() });
                return response.status(200).send({ message: "Stock sold and removed from portfolio as quantity reached zero." });
            } else {
                stock.totalCost -= sellPrice * quantity;
                stock.avgCost = stock.totalCost / newTotalQuantity;
                stock.quantity = newTotalQuantity;

                await stock.save();
                return response.status(200).send(stock);
            }
        } else {
            return response.status(404).send({ message: "Stock not found in the portfolio." });
        }
    } catch (error) {
        console.error('Error when selling stock: ', error.message);
        response.status(500).send({ message: error.message });
    }
});

module.exports = router;
