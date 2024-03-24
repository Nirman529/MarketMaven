// src/contexts/SearchContext.js
import React, { createContext, useState, useContext } from 'react';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
    const [searchData, setSearchData] = useState({
        inputValue: "",
        stockInfo: null,
        companyPeers: null,
        companyLatestPriceOfStock: null,
        news: [],
        selectedNews: null,
        suggestions: [],
        showSuggestions: false,
        isLoading: false,
        showModal: false,
        arrowIcon: null,
        priceColor: '',
        isInWatchlist: false,
        companyInsiderInformation: null,
        hourlyData: null,
        recommendationData: null,
        historicalData: null,
        earningsData: null,
        portfolioData: {},
        quantity: 0,
        buyTotals: 0,
        searchTrigger: "",
        totals: {
            totalMspr: 0,
            positiveMspr: 0,
            negativeMspr: 0,
            totalChange: 0,
            positiveChange: 0,
            negativeChange: 0,
        },
        buyModal: false,
        sellModal: false,
    });

    // Functions to manipulate the state can be added here if necessary

    return (
        <SearchContext.Provider value={{ searchData, setSearchData }}>
            {children}
        </SearchContext.Provider>
    );
};
