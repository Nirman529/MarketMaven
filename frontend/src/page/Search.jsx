import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStockInfo, getCompanyLatestPriceOfStock, loadSuggestions, getCompanyPeers, getNews } from "../api/api.js";
import { TailSpin } from 'react-loader-spinner';
import { Row, Col, Button, Tabs, Tab, Card, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import Highcharts from 'highcharts';
import HighChartsReact from 'highcharts-react-official';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "bootstrap/dist/css/bootstrap.min.css";

const Search = () => {
	const [inputValue, setInputValue] = useState("");
	const [stockInfo, setStockInfo] = useState(null);
	const [companyPeers, setCompanyPeers] = useState(null);
	const [companyLatestPriceOfStock, setCompanyLatestPriceOfStock] = useState(null);
	const [news, setNews] = useState(null);
	const [selectedNews, setSelectedNews] = useState(null);
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [arrowIcon, setArrowIcon] = useState(null);
	const [priceColor, setPriceColor] = useState('');

	const twitterBaseUrl = "https://twitter.com/intent/tweet";
	const tweetText = encodeURIComponent(selectedNews?.headline);
	const tweetUrl = encodeURIComponent(selectedNews?.url);
	const twitterShareUrl = `${twitterBaseUrl}?text=${tweetText}&url=${tweetUrl}`;

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
					const _news = await getNews(ticker);
					const validNews = await _news?.data.filter(isValid);

					const priceChange = companyLatestPriceOfStock?.d;
					const isPriceUp = priceChange > 0;

					setPriceColor(isPriceUp ? 'green' : 'red');
					setArrowIcon(isPriceUp? <i className="bi bi-caret-up-fill"></i> : <i className="bi bi-caret-down-fill"></i>)

					setNews(validNews);
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

	const isValid = (item) => {
		const requirement = ['image', 'headline'];
		return requirement.every(key => item[key] !== undefined && item[key] !== "");
	}

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

	const handleClose = () => {
		setShowModal(false);
	}

	const handleShow = (newsItem) => {
		setSelectedNews(newsItem);
		setShowModal(true)
	};

	const newsDate = (timestamp) => {
		const date = new Date(timestamp * 1000);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	};

	const getFacebookShareLink = (articleUrl) => {
		const facebookBaseUrl = "https://www.facebook.com/sharer/sharer.php";
		const shareUrl = encodeURIComponent(articleUrl);
		return `${facebookBaseUrl}?u=${shareUrl}`;
	};

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
										<h1 style={{ color: priceColor }}>{roundNumber(companyLatestPriceOfStock?.c)}</h1>
										<h2 style={{ color: priceColor }}>{arrowIcon} {roundNumber(companyLatestPriceOfStock?.d)} ({roundNumber(companyLatestPriceOfStock?.dp)}%)</h2>
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
										<Row>
											{news?.slice(0, 20).map((item, key) => {
												return <>
													<Col md={6} className="mb-4 hover-effect" key={key}>
														<Card onClick={() => handleShow(item)}>
															<Row className=''>
																<img src={item.image} className="news-image m-3" alt="" />
																<Col className='d-flex justify-content-center align-items-center text-center'>
																	<Card.Body>
																		<Card.Title>{item.headline}</Card.Title>
																	</Card.Body>
																</Col>
															</Row>
														</Card>
													</Col>
												</>
											})}
										</Row>
									</Tab>
									<Tab eventKey="charts" title="Charts" transition={false}>
										Tab content for Charts
									</Tab>
									<Tab eventKey="insights" title="Insights" transition={false}>
										Tab content for Insights
									</Tab>
								</Tabs>
							</div>
							<Modal show={showModal} onHide={handleClose} >
								<Modal.Header closeButton>
									<Modal.Title>
										<h1>
											{selectedNews?.source}<br />
										</h1>
										<div className='date-news'>
											{newsDate(selectedNews?.datetime)}
										</div>
									</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									<h3>{selectedNews?.headline}</h3>
									<div>{selectedNews?.summary}</div>
									For more details click <a href={selectedNews?.url} target='_blank'>here</a>

									<div className='share-box'>
										<div className='m-3 mb-0'>share</div><br />

										<a className="twitter-share-button m-3 mt-0 mb-3 pb-3"
											href={twitterShareUrl}
											target='_blank'
											rel='noopener noreferrer'
										>
											<FontAwesomeIcon className='fa-3x mb-3' icon={faXTwitter} style={{ color: 'black' }} />
										</a>
										<a
											href={getFacebookShareLink(selectedNews?.url)}
											target="_blank"
											rel="noopener noreferrer">
											<FontAwesomeIcon className="fa-3x mb-3" icon={faFacebookSquare} />
										</a>
									</div>
								</Modal.Body>
							</Modal>
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