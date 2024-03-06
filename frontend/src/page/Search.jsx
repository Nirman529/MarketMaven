import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Search = () => {
	const [inputValue, setInputValue] = useState("");
	const [stockInfo, setStockInfo] = useState(null);
	let { ticker } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		if (ticker) {
			const fetchStockInfo = async () => {
				try {
					const response = await fetch(`http://localhost:3000/api/company_description?symbol=${ticker}`);
					console.log('response fetch stock info: ', response);
					if (!response.ok) {
						throw new Error('Network response was not ok');
					}
					const data = await response.json();
					setStockInfo(data);
				} catch (error) {
					console.error('Error with try block', error);
				}
			};
			fetchStockInfo();
		}
	}, [ticker]);

	const handleSearch = (event) => {
		event.preventDefault();
		navigate(`/search/${inputValue}`);
	};

	return (
		<>
			<div className="main-content">
				<h1>STOCK SEARCH</h1>
				<form action="" className="search-box mt-5">
					<input
						className='ms-3'
						type="text"
						placeholder="Enter stock ticker symbol"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
					/>
					<button onClick={handleSearch}>🔍</button>
					<button onClick={() => setInputValue('')} className='me-3'>✖️</button>
				</form>
				{
					stockInfo ?
						<div>
							data
						</div>
						:
						<div>
							no data
						</div>
				}
			</div>
		</>
	)
}

export default Search