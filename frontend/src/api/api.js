import axios from "axios";
import apiLink from "../apiLink";

export const getStockInfo = async (ticker) => {
    // return async (dispatch) => {
    //     await axios
    //         .get(`${apiLink}/api/company_description?symbol=${ticker}`)
    //         .then((response) => {

    //         }).catch((error) => {
    //         console.log('error in fetchStockInfo', error)
    //     })
    // }
    try {
        const response = await fetch(`${apiLink}/api/company_description?symbol=${ticker}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error with try block', error);
    }
};

export const loadSuggestions = async (inputValue) => {
    try {
        const response = await fetch(`${apiLink}/api/autocomplete?query=${inputValue}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data_ = await response.json();
        const data = await data_.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching autocomplete data:', error);
        return [];
    }
};


export const getCompanyLatestPriceOfStock = async (inputValue) => {
    try {
        const response = await fetch(`${apiLink}/api/company_latest_price_of_stock?symbol=${inputValue}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching company_latest_price_of_stock:', error);
        return [];
    }
};

export const getCompanyPeers = async (inputValue) => {
    try {
        const response = await fetch(`${apiLink}/api/company_peers?symbol=${inputValue}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching company_latest_price_of_stock:', error);
        return [];
    }
};

export const getNews = async (inputValue) => {
    try {
        const response = await fetch(`${apiLink}/api/news?symbol=${inputValue}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching company_latest_price_of_stock:', error);
        return [];
    }
};

export const getCompanyInsiderInformation = async (inputValue) => {
    try {
        const response = await fetch(`${apiLink}/api/company_insider_sentiment?symbol=${inputValue}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching company_latest_price_of_stock:', error);
        return [];
    }
};

export const getHourlyData = async (inputValue) => {
    try {
        const response = await fetch(`${apiLink}/api/polygon_data?symbol=${inputValue}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching company_latest_price_of_stock:', error);
        return [];
    }
};

export const getRecommendationData = async (inputValue) => {
    try {
        const response = await fetch(`${apiLink}/api/company_recommendation_trends?symbol=${inputValue}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching company_latest_price_of_stock:', error);
        return [];
    }
};

export const getHistoricalData = async (inputValue) => {
    try {
        const response = await fetch(`${apiLink}/api/historical_data?symbol=${inputValue}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching historical_data:', error);
        return [];
    }
};

export const getEarningsData = async (inputValue) => {
    try {
        const response = await fetch(`${apiLink}/api/company_earnings?symbol=${inputValue}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching company_earnings:', error);
        return [];
    }
};

// -------------------------watchlist apis
export const getWatchlistData = async () => {
    try {
        const response = await fetch(`${apiLink}/watchlist/get`);
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('error in fetching watchlist data', error)
        return [];
    }
}

export const addToWatchlist = async (ticker, name) => {
    const apiUrl = `${apiLink}/watchlist/add`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ticker, name }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Stock added to watchlist:', data);
    } catch (error) {
        console.error('Failed to add to watchlist:', error);
    }
};

export const removeFromWatchlist = async (ticker) => {
    const apiUrl = `${apiLink}/watchlist/remove/${ticker}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                // Add any headers like Authorization if your API requires it
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Stock removed from watchlist:', data);
        return data;
    } catch (error) {
        console.error('Failed to remove from watchlist:', error);
    }
};

// ------------------------- portfolio apis

export const getPortfolioData = async () => {
    try {
        const response = await fetch(`${apiLink}/portfolio/get`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.log('error in fetching watchlist data', error)
        return [];
    }
}
export const addToPortfolio = async (ticker, name, quantity, avgCost) => {
    const apiUrl = `${apiLink}/portfolio/add`;
    const totalCost = quantity * avgCost;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ticker, name, quantity, avgCost, totalCost }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Stock added to portfolio:', data);
    } catch (error) {
        console.error('Failed to add to portfolio:', error);
    }
};

export const removeFromPortfolio = async (ticker, quantity, sellPrice) => {
    const apiUrl = `${apiLink}/portfolio/update/sell/${ticker}`;
    // Assume you sell some amount of stock at a given price and need to update the portfolio

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity, sellPrice }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Updated portfolio after selling stock:', data);
    } catch (error) {
        console.error('Failed to update portfolio after selling:', error);
    }
};