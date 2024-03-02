import { PORT } from './config.js';
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.get('/api/company_description', async (req, res) => {

    const symbol = req.params.symbol;
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FIN_KEY}`);
        return res.send(response.data);
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
        res.status(500).send('');
    }
});

const updateDate = (currentDate) => {   
    var year = currentDate.getFullYear();
    var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    var day = currentDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`
}

app.get('/api/company_description', async (req, res) => {
    const symbol = req.params.symbol;

    const currentDate = new Date();
    const to = updateDate(currentDate);

    currentDate.setMonth(currentDate.getMonth() - 6);
    currentDate.setDate(currentDate.getDate() - 1);
    const from = updateDate(currentDate);

    try {
        const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${POLY_KEY}`);
        res.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching data from polygon.io",
            error: error.message
        });
        res.status(500).send('');
    }
});

app.get('/api/company_latest_price_of_stock', async (req, res) => {
    const symbol = req.params.symbol;
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
        
        res.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        res.status(500).send('');
    }
});

app.get('/api/autocomplete', async (req, res) => {
    const query = req.params.query;
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
        
        res.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        res.status(500).send('');
    }
});

app.get('/api/news', async (req, res) => {
    const symbol = req.params.symbol;

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
        
        res.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        res.status(500).send('');
    }
});


app.get('/api/company_recommendation_trends', async (req, res) => {
    const symbol = req.params.symbol;
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
        
        res.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        res.status(500).send('');
    }
});

app.get('/api/company_insider_sentiment', async (req, res) => {
    const symbol = req.params.symbol;
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
        
        res.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        res.status(500).send('');
    }
});


app.get('/api/company_peers', async (req, res) => {
    const symbol = req.params.symbol;
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${FIN_KEY}`);
        /**
            response    List of company symbols
         */
        
        res.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        res.status(500).send('');
    }
});


app.get('/api/company_earnings', async (req, res) => {
    const symbol = req.params.symbol;
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&token=${FIN_KEY}`);
        /**
            Actual      Actual earnings results
            Estimate    Estimated earnings
            Period      Reported period
            Symbol      Company symbol
         */
        
        res.json({
            success: true,
            data: response.data,
            message: "data fetched successfully"
        });
        return res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching data from Finnhub",
            error: error.message
        });
        res.status(500).send('');
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
