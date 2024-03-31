const express = require('express');
const axios = require('axios');
const { POLY_KEY, FIN_KEY, _POLY_KEY } = require('../config.js');

const router = express.Router();

router.get('/company_description', async (request, response) => {
    const symbol = request.query.symbol;
    try {
        const aresponse = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FIN_KEY}`);
        response.json({
            success: true,
            data: aresponse.data,
            message: "Company data fetched successfully"
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from finnhub.io",
            error: error.message
        });
    }
});

const updateDate = (currentDate) => {
    var day = currentDate.getDate().toString().padStart(2, '0');
    var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    var year = currentDate.getFullYear();
    return `${year}-${month}-${day}`
}

router.get('/polygon_data', async (request, response) => {
    const symbol = request.query.symbol.toUpperCase();

    const currentDate = new Date();
    const to = updateDate(currentDate);

    currentDate.setDate(currentDate.getDate() - 1);
    const from = updateDate(currentDate);

    try {
        const aresponse = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/hour/${from}/${to}?adjusted=true&sort=asc&apiKey=${_POLY_KEY}`);
        response.json({
            success: true,
            data: aresponse.data,
            message: "polygon data fetched successfully"
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from polygon.io",
            error: error.message
        });
    }
});

router.get('/company_latest_price_of_stock', async (request, response) => {
    const symbol = request.query.symbol;
    try {
        const aresponse = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FIN_KEY}`);

        response.json({
            success: true,
            data: aresponse.data,
            message: "data fetched successfully"
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
    }
});

router.get('/autocomplete', async (request, response) => {
    const query = request.query.query;
    try {
        const aresponse = await axios.get(`https://finnhub.io/api/v1/search?q=${query}&token=${FIN_KEY}`);
        const filteredResults = aresponse.data.result.filter(item =>
            item.type === 'Common Stock' && !item.symbol.includes('.')
        );
        response.json({
            data: filteredResults,
        });

    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
    }
});

router.get('/news', async (request, response) => {
    const symbol = request.query.symbol;

    const currentDate = new Date();

    var year = currentDate.getFullYear();
    var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    var day = currentDate.getDate().toString().padStart(2, '0');

    const to = `${year}-${month}-${day}`;
    currentDate.setMonth(currentDate.getMonth() - 6);
    currentDate.setDate(currentDate.getDate() - 1);

    var year = currentDate.getFullYear();
    var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    var day = currentDate.getDate().toString().padStart(2, '0');
    const from = `${year}-${month}-${day}`;

    try {
        const aresponse = await axios.get(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FIN_KEY}`);
        const filteredNews = aresponse.data.filter(item => item.image && item.headline);

        response.json({
            success: true,
            data: filteredNews,
            message: "data fetched successfully"
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
    }
});


router.get('/company_recommendation_trends', async (request, response) => {
    const symbol = request.query.symbol;
    try {
        const aresponse = await axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${FIN_KEY}`);

        response.json({
            success: true,
            data: aresponse.data,
            message: "data fetched successfully"
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
    }
});

router.get('/company_insider_sentiment', async (request, response) => {
    const symbol = request.query.symbol;
    try {
        const aresponse = await axios.get(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${symbol}&from=2022-01-01&token=${FIN_KEY}`);

        response.json({
            success: true,
            data: aresponse.data,
            message: "data fetched successfully"
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
    }
});


router.get('/company_peers', async (request, response) => {
    const symbol = request.query.symbol;
    try {
        const aresponse = await axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${FIN_KEY}`);

        response.json({
            success: true,
            data: aresponse.data,
            message: "data fetched successfully"
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
    }
});

router.get('/company_earnings', async (request, response) => {
    const symbol = request.query.symbol;
    try {
        const aresponse = await axios.get(`https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&token=${FIN_KEY}`);

        response.json({
            success: true,
            data: aresponse.data,
            message: "data fetched successfully"
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
    }
});

router.get('/historical_data', async (request, response) => {
    const symbol = request.query.symbol.toUpperCase();
    try {
        const today = new Date().toISOString().split('T')[0];
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const fromDate = twoYearsAgo.toISOString().split('T')[0];

        const res = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${today}?adjusted=true&sort=asc&apiKey=${POLY_KEY}`);
        const chartData = await res.data.results.map(result => ({
            timestamp: result.t,
            open: result.o,
            high: result.h,
            low: result.l,
            close: result.c,
            volume: result.v
        }));

        response.json(chartData);
    } catch (error) {
        console.error('Error fetching chart data:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
