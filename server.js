const express = require('express');
const axios = require('axios');
const axiosRetry = require('axios-retry');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});


axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
        return retryCount * 1000;
    },
    retryCondition: (error) => {
        return error.response && error.response.status === 503;
    },
});

app.get('/api/data', async (req, res) => {
    try {
        const response = await axios.get('YOUR_API_ENDPOINT');
        return res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
