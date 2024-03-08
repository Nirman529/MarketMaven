import express from 'express';
import axios from 'axios';
import { POLY_KEY, FIN_KEY } from '../config.js';

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
        response.status(500).json({
            success: false,
            message: "Error fetching data from polygon.io",
            error: error.message
        });
    }
});

const updateDate = (currentDate) => {
    var year = currentDate.getFullYear();
    var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    var day = currentDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`
}

router.get('/polygon_data', async (request, response) => {
    const symbol = request.query.symbol;

    const currentDate = new Date();
    const to = updateDate(currentDate);

    currentDate.setMonth(currentDate.getMonth() - 6);
    currentDate.setDate(currentDate.getDate() - 1);
    const from = updateDate(currentDate);

    try {
        const aresponse = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${POLY_KEY}`);
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
            // data: aresponse.data,
            data: filteredResults, // Return only filtered results

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


router.get('/company_recommendation_trends', async (request, response) => {
    const symbol = request.query.symbol;
    try {
        const aresponse = await axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${FIN_KEY}`);
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
        const aresponse = await axios.get(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${symbol}&token=${FIN_KEY}`);
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
        /**
            response    List of company symbols
         */

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
        a
    }
});


router.get('/company_earnings', async (request, response) => {
    const symbol = request.query.symbol;
    try {
        const aresponse = await axios.get(`https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&token=${FIN_KEY}`);
        /**
            Actual      Actual earnings results
            Estimate    Estimated earnings
            Period      Reported period
            Symbol      Company symbol
         */

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