import express from 'express';
import { Stock } from '../models/stockModel.js';
import axios from 'axios';
// add a stock
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

router.get('/api/company_description', async (request, response) => {

    const symbol = request.params.symbol;
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FIN_KEY}`);
        return response.send(response.data);
        /*
            country                 Country Name
            currency                Currency Symbol
            exchange                Company’s Exchange
            name                    Company’s Name
            ticker                  Company’s Symbol
            ipo                     Company’s Start Date
            marketCapitalization    Company’s MarketCap
            shareOutstanding        Company’s Shares
            logo                    Company’s Logo
            phone                   Company’s Contact No.
            weburl                  Company’s Website Url
            finnhubIndustry         Company’s Industry
         */
    } catch (error) {
        console.error(error);
        response.status(500).send('');
    }
});

const updateDate = (currentDate) => {
    var year = currentDate.getFullYear();
    var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    var day = currentDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`
}

router.get('/api/company_description', async (request, response) => {
    const symbol = request.params.symbol;

    const currentDate = new Date();
    const to = updateDate(currentDate);

    currentDate.setMonth(currentDate.getMonth() - 6);
    currentDate.setDate(currentDate.getDate() - 1);
    const from = updateDate(currentDate);

    try {
        const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${POLY_KEY}`);
        response.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return response.send(response.data);
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from polygon.io",
            error: error.message
        });
        response.status(500).send('');
    }
});

router.get('/api/company_latest_price_of_stock', async (request, response) => {
    const symbol = request.params.symbol;
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FIN_KEY}`);
        /**
            c   current price
            d   change in price
            dp  percentage change in price
            h   high price of  the day.
            l   low price of the day.
            o   open price of the day.
            pc  Previous close price
            t   Timestamp of last stock data
         */

        response.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return response.send(response.data);
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        response.status(500).send('');
    }
});

router.get('/api/autocomplete', async (request, response) => {
    const query = request.params.query;
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/search?q=${query}&token=${FIN_KEY}`);
        /**
            count           number of results
            result          array of search result
            description     symbol description
            displaySymbol   display symbol name
            symbol          unique symbol used to identify this symbol
                            used in /stock/candle endpoint.
            type            security type
         */

        response.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return response.send(response.data);
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        response.status(500).send('');
    }
});

router.get('/api/news', async (request, response) => {
    const symbol = request.params.symbol;

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
        const response = await axios.get(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FIN_KEY}`);

        /**
            category    News category
            datetime    Published timestamp in UNIX
            headline    News headline
            id          News id
            image       Thumbnail image URL
            related     Related stocks and companies mentioned
            source      News source
            summary     News summary
            url         url of original article
         */

        response.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return response.send(response.data);
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        response.status(500).send('');
    }
});


router.get('/api/company_recommendation_trends', async (request, response) => {
    const symbol = request.params.symbol;
    const from = '2022-01-01';
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&from=${from}&token=${FIN_KEY}`);
        /**
            Buy         Recommendation count of buy category
            Hold        Recommendation count of hold category
            period      Update period
            sell        Recommendation count of sell category
            strongBuy   Recommendation count of strongbuy category
            strongSell  Recommendation count of strongsell category
            Symbol      Company symbol
         */

        response.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return response.send(response.data);
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        response.status(500).send('');
    }
});

router.get('/api/company_insider_sentiment', async (request, response) => {
    const symbol = request.params.symbol;
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${symbol}&token=${FIN_KEY}`);
        /**
            data        array of entries containing month by month
                        insider insight data
            symbol      Ticker symbol of the stock. E.g.: MSFT
            year        year of the data in this entry
            month       month of the data in this entry
            change      Net buying/selling from all insiders'transactions.
            mspr        Monthly share purchase ratio
            symbol      Ticker symbol of the stock. E.g.: MSFT
         */

        response.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return response.send(response.data);
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        response.status(500).send('');
    }
});


router.get('/api/company_peers', async (request, response) => {
    const symbol = request.params.symbol;
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${FIN_KEY}`);
        /**
            response    List of company symbols
         */

        response.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return response.send(response.data);
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        response.status(500).send('');
    }
});


router.get('/api/company_earnings', async (request, response) => {
    const symbol = request.params.symbol;
    try {
        const response = await fetch(`https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&token=${FIN_KEY}`);
        /**
            Actual      Actual earnings results
            Estimate    Estimated earnings
            Period      Reported period
            Symbol      Company symbol
         */

        response.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return response.send(response.data);
    } catch (error) {
        console.error(error);
        response.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        response.status(500).send('');
    }
});

// -----------------------------------------------------------------------------
/**
    4.2.1 X (formerly known as Twitter)
    Refer the following link for details:
    https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/overview

    4.2.2 Facebook
    Refer the following link for details:
    https://developers.facebook.com/docs/plugins/share-button/
 */

// -----------------------------------------------------------------------------
export default router;