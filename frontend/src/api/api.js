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