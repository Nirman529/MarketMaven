import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStockInfo, loadSuggestions } from "../api/api.js";
import { TailSpin } from 'react-loader-spinner';

const Search = () => {
	const [inputValue, setInputValue] = useState("");
	const [stockInfo, setStockInfo] = useState(null);
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	let { ticker } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		if (ticker) {
			const getInfo = async () => {
				try {
					const stockData = await fetchStockInfo(ticker);
					setStockInfo(stockData);
				} catch (error) {
					console.error('Error fetching stock info:', error);
				}
			};
			getInfo();
		}
	}, [ticker]);

	useEffect(() => {
		if (inputValue === "") {
			setSuggestions([]);
			return;
		}
		const getSuggestions = async () => {
			setSuggestions([]);
			setIsLoading(true);
			try {
				const suggestionData = await loadSuggestions(inputValue); // Adjust the function parameters as necessary
				setSuggestions(suggestionData);
			} catch (error) {
				console.error('Error fetching suggestions:', error);
			} finally {
				if (suggestions == []) {
					setStockInfo(null);
				}
				setIsLoading(false);
			}
		};
		getSuggestions();
	}, [inputValue]);

	useEffect(() => {
		if (inputValue) {
			navigate(`/search/${inputValue}`);
		}
	}, [inputValue, navigate]);

	const handleSuggestionClick = (suggestion) => {
		setInputValue(suggestion.symbol); // This will trigger the useEffect above
		setSuggestions([]);
		setShowSuggestions(false);
	};

	// Simplify handleSearch since the navigation should happen in the useEffect above
	const handleSearch = (event) => {
		event.preventDefault(); // Just prevent the default behavior
	};


	const autoComplete = (e) => {
		setInputValue(e.target.value);
		setShowSuggestions(true);
	}

	const clearPage = () => {
		setInputValue('')
		setStockInfo(null)
	}

	return (
		<>
			<div className="main-content">
				<h1>STOCK SEARCH</h1>
				<form action="" className="search-box mt-5">
					<div className='m-0'>
						<input
							className='ms-3'
							type="text"
							placeholder="Enter stock ticker symbol"
							value={inputValue}
							onChange={(e) => autoComplete(e)}
							onFocus={() => setShowSuggestions(true)}
							onBlur={() => {
								// Delay hiding suggestions so we can capture click events on suggestions
								setTimeout(() => setShowSuggestions(false), 100);
							}}
						/>
						{showSuggestions && suggestions.length > 0 ? (
							<ul className="suggestions-list ms-3 m-0 p-0">
								{suggestions.slice(0, 5).map((suggestion, index) => (
									<li className='' key={index} onClick={() => handleSuggestionClick(suggestion)}>
										{suggestion.symbol} | {suggestion.description}
									</li>
								))}
							</ul>
						) : (isLoading ? (
							<ul className="suggestions-list ms-3 m-0 p-0">
								<li className='' key="spin">
									<TailSpin
										visible={true}
										height="30"
										width="30"
										color="#000080"
										ariaLabel="tail-spin-loading"
										radius="1"
										wrapperStyle={{}}
										wrapperClass=""
									/>
								</li>
							</ul>
						) : (
							<></>
						)
						)}
					</div>
					<button onClick={handleSearch}><i className="bi bi-search" style={{ fontSize: '1rem' }}></i></button>
					<button onClick={() => clearPage()} className='me-3'><i className="bi bi-x" style={{ fontSize: '2rem' }}></i></button>
				</form>
				{
					stockInfo ?
						<div>
							{stockInfo.data.ticker}
						</div>
						:
						<div className="error-message">
							No data found. Please enter a valid Ticker
						</div>
				}
			</div>
		</>
	)
}

export default Search