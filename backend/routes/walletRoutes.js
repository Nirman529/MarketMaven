import express from 'express';
import { Wallet } from '../models/walletModel.js';
const router = express.Router();

router.get('/get', async (request, response) => {
    try {
        const existingWallet = await Wallet.findOne({});
        if (!existingWallet) {
            const newWallet = new Wallet({ balance: 25000 }); // Assuming your Wallet schema has a 'balance' field
            await newWallet.save();
            return response.status(201).json(newWallet);
        } else {
            return response.status(200).json(existingWallet);
        }
    } catch (error) {
        console.error("Error initializing wallet:", error);
        response.status(500).send({ message: "An error occurred while initializing the wallet." });
    }
});

router.post('/deposit', async (request, response) => {
    const { amount } = request.body;
    if (amount <= 0) {
        return response.status(400).send({ message: "Deposit amount must be greater than zero." });
    }
    try {
        const wallet = await Wallet.findOne({});
        wallet.balance += amount;
        await wallet.save();
        return response.status(200).json(wallet);
    } catch (error) {
        console.error("Error depositing to wallet:", error);
        response.status(500).send({ message: "An error occurred while depositing to the wallet." });
    }
});

router.post('/withdraw', async (request, response) => {
    const { amount } = request.body;
    if (amount <= 0) {
        return response.status(400).send({ message: "Withdrawal amount must be greater than zero." });
    }
    try {
        const wallet = await Wallet.findOne({});
        if (wallet.balance < amount) {
            return response.status(400).send({ message: "Insufficient balance in the wallet." });
        }
        wallet.balance -= amount;
        await wallet.save();
        return response.status(200).json(wallet);
    } catch (error) {
        console.error("Error withdrawing from wallet:", error);
        response.status(500).send({ message: "An error occurred while withdrawing from the wallet." });
    }
});

export default router;