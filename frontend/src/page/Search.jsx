import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStockInfo, getCompanyLatestPriceOfStock, loadSuggestions, getCompanyPeers } from "../api/api.js";
import { TailSpin } from 'react-loader-spinner';
import { Row, Col, Button, Tabs, Tab } from 'react-bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css';
import "bootstrap/dist/css/bootstrap.min.css";

const Search = () => {
	const [inputValue, setInputValue] = useState("");
	const [stockInfo, setStockInfo] = useState(null);
	const [companyPeers, setCompanyPeers] = useState(null);
	const [companyLatestPriceOfStock, setCompanyLatestPriceOfStock] = useState(null);
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
					setStockInfo(stockData.data);
					const companyLatestPriceOfStockData = await getCompanyLatestPriceOfStock(ticker);
					setCompanyLatestPriceOfStock(companyLatestPriceOfStockData.data);
					const _companyPeers = await getCompanyPeers(ticker);
					setCompanyPeers(_companyPeers.data);
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
				const suggestionData = await loadSuggestions(inputValue);
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
		setInputValue(suggestion.symbol);
		setSuggestions([]);
		setShowSuggestions(false);
	};

	const handleSearch = (event) => {
		event.preventDefault();
	};


	const autoComplete = (e) => {
		setInputValue(e.target.value);
		setShowSuggestions(true);
	}

	const clearPage = () => {
		setInputValue('')
		setStockInfo(null)
	}

	const getUnixDate = (unixTimestamp) => {
		// Create a new JavaScript Date object based on the timestamp multiplied by 1000 so that the argument is in milliseconds, not seconds.
		const date = new Date(unixTimestamp * 1000);
		const year = date.getFullYear();
		const month = ('0' + (date.getMonth() + 1)).slice(-2); // Month is 0-indexed in JavaScript, add leading 0 and slice to ensure two digits
		const day = ('0' + date.getDate()).slice(-2); // Add leading 0 and slice to ensure two digits

		const hours = ('0' + date.getHours()).slice(-2); // Add leading 0 and slice to ensure two digits
		const minutes = ('0' + date.getMinutes()).slice(-2); // Add leading 0 and slice to ensure two digits
		const seconds = ('0' + date.getSeconds()).slice(-2); // Add leading 0 and slice to ensure two digits

		const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
		return formattedDate;
	}

	const roundNumber = (num) => {
		return Math.round((num + Number.EPSILON) * 100) / 100
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
						{showSuggestions && suggestions?.length > 0 ? (
							<ul className="suggestions-list ms-3 m-0 p-0">
								{suggestions?.slice(0, 5).map((suggestion, index) => (
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
						<>
							<div className="company-details mt-3">
								<Row>
									<Col className='text-center'>
										<Row>
											<h1>{stockInfo?.ticker} **</h1>
											<h3>{stockInfo?.name}</h3>
											<div>{stockInfo?.exchange}</div>
											<div>
												<Button className='btn btn-success me-3 px-3'>Buy</Button>
												<Button className='btn btn-danger px-3'>sell</Button>
											</div>
										</Row>
									</Col>
									<Col>
										<img src={stockInfo?.logo} alt={stockInfo?.logo} className='stock-image' />
									</Col>
									<Col>
										{console.log('companyPeers', companyPeers)}
										{console.log('stockInfo.data', stockInfo)}
										{console.log('companyLatestPriceOfStock.data', companyLatestPriceOfStock)}
										<h1 className=''>{roundNumber(companyLatestPriceOfStock?.c)}</h1>
										<h2 className=''>arrow nakh bhai {roundNumber(companyLatestPriceOfStock?.d)} ({roundNumber(companyLatestPriceOfStock?.dp)}%)</h2>
										<div className=''>{getUnixDate(companyLatestPriceOfStock?.t)}</div>
									</Col>
								</Row>
								<Row className='d-flex justify-content-center text-center red'>
									{ } Market closed on date
								</Row>
							</div>
							<div className="company-dashboard">
								<Tabs defaultActiveKey="summary" id="company-dashboard" transition={false} className="tabs mb-3" justify>
									<Tab eventKey="summary" title="Summary" transition={false}>
										<Row>
											<Col md={6}>
												<Row className='mb-3'>
													<Col md={6} className="text-center">
														<div><span className='fw-bold'>High Price:</span> {roundNumber(companyLatestPriceOfStock?.h)}</div>
														<div><span className='fw-bold'>Low Price:</span> {roundNumber(companyLatestPriceOfStock?.l)}</div>
														<div><span className='fw-bold'>Open Price:</span> {roundNumber(companyLatestPriceOfStock?.o)}</div>
														<div><span className='fw-bold'>Prev. Close:</span> {roundNumber(companyLatestPriceOfStock?.c)}</div>
													</Col>
												</Row>
												<Row className="mt-1">
													<Col>
														<h5 className='fw-bold mb-2'>About the company</h5>
														<div className='mt-2'><span className='fw-bold'>IPO Start Date:</span> {stockInfo?.ipo}</div>
														<div className='mt-2'><span className='fw-bold'>Industry:</span> {stockInfo?.finnhubIndustry}</div>
														<div className='mt-2'><span className='fw-bold'>Webpage:</span> <a href={stockInfo?.weburl} target="_blank" rel="noreferrer">{stockInfo?.weburl}</a></div>
														<div className='fw-bold mt-2'>Company peers:</div>
														not linked aa baju ae bhai
														<p className='mt-2'>{companyPeers?.map((item) => {
															return <span key={item} className='anchor-tag'>{item}, </span>;
														})}</p>
													</Col>
												</Row>
											</Col>
											<Col md={6}>
												{/* <YourChartComponent /> */}
												<div className="chart-placeholder">AAPL Hourly Price Variation</div>
											</Col>
										</Row>
									</Tab>
									<Tab eventKey="news" title="Top News" transition={false}>
										Tab content for Top News
									</Tab>
									<Tab eventKey="charts" title="Charts" transition={false}>
										Tab content for Charts
									</Tab>
									<Tab eventKey="insights" title="Insights" transition={false}>
										Tab content for Insights
									</Tab>
								</Tabs>
							</div>
						</>
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