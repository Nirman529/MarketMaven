export const fetchStockInfo = async (ticker) => {
    try {
        const response = await fetch(`http://localhost:3000/api/company_description?symbol=${ticker}`);
        console.log('response fetch stock info: ', response);
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
        const response = await fetch(`http://localhost:3000/api/autocomplete?query=${inputValue}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data_ = await response.json();
        const data = await data_.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching autocomplete data:', error);
        return []; // Return an empty array in case of error
    }
};


export const getCompanyLatestPriceOfStock = async (inputValue) => {
    try {
        const response = await fetch(`http://localhost:3000/api/company_latest_price_of_stock?symbol=${inputValue}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching company_latest_price_of_stock:', error);
        return []; // Return an empty array in case of error
    }
};

export const getCompanyPeers = async (inputValue) => {
    try {
        const response = await fetch(`http://localhost:3000/api/company_peers?symbol=${inputValue}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching company_latest_price_of_stock:', error);
        return []; // Return an empty array in case of error
    }
};

export const getNews = async (inputValue) => {
    try {
        const response = await fetch(`http://localhost:3000/api/news?symbol=${inputValue}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching company_latest_price_of_stock:', error);
        return []; // Return an empty array in case of error
    }
};