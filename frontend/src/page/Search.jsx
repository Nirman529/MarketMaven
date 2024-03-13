import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStockInfo, getCompanyLatestPriceOfStock, loadSuggestions, getCompanyPeers, getNews, getCompanyInsiderInformation, getHourlyData } from "../api/api.js";
import { TailSpin } from 'react-loader-spinner';
import { Table, Row, Col, Button, Tabs, Tab, Card, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
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
	const [companyInsiderInformation, setCompanyInsiderInformation] = useState(null);
	const [hourlyData, setHourlyData] = useState(null);
	const [totals, setTotals] = useState({
		totalMspr: 0,
		positiveMspr: 0,
		negativeMspr: 0,
		totalChange: 0,
		positiveChange: 0,
		negativeChange: 0,
	});

	const twitterBaseUrl = "https://twitter.com/intent/tweet";
	const tweetText = encodeURIComponent(selectedNews?.headline);
	const tweetUrl = encodeURIComponent(selectedNews?.url);
	const twitterShareUrl = `${twitterBaseUrl}?text=${tweetText}&url=${tweetUrl}`;

	let { ticker } = useParams();
	const navigate = useNavigate();

	const performSearchWithSymbol = async (symbol) => {
		if (!symbol) {
			console.log("Please enter a ticker symbol to search.");
			return;
		}
		try {
			const stockData = await fetchStockInfo(symbol);
			const companyLatestPriceOfStockData = await getCompanyLatestPriceOfStock(symbol);
			const _companyPeers = await getCompanyPeers(symbol);
			const _news = await getNews(symbol);
			const validNews = await _news?.data.filter(isValid);
			const companyInsiderInfo = await getCompanyInsiderInformation(symbol);
			const hourData = await getHourlyData(symbol);
			const priceChange = companyLatestPriceOfStock?.d;
			const isPriceUp = priceChange > 0;

			setHourlyData(await convertData(hourData?.data.results));
			setCompanyLatestPriceOfStock(companyLatestPriceOfStockData.data);
			setCompanyPeers(_companyPeers.data);
			setStockInfo(stockData.data);
			setPriceColor(isPriceUp ? 'green' : 'red');
			setArrowIcon(isPriceUp ? <i className="bi bi-caret-up-fill"></i> : <i className="bi bi-caret-down-fill"></i>)
			setCompanyInsiderInformation(await companyInsiderInfo?.data.data);
			setNews(validNews);
		} catch (error) {
			console.error('Error fetching stock info:', error);
		}
	};

	const convertData = (data) => {
		const newArray = data?.map(item => {
			const date = new Date(item.t);
			const closePrice = item.c;

			return [
				Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()),
				closePrice
			];
		});
		return newArray;
	}

	const performSearch = () => {
		if (!inputValue.trim()) {
			console.log("Input value is empty.");
			return;
		}
		performSearchWithSymbol(inputValue);
	}

	useEffect(() => {
		if (companyInsiderInformation?.length > 0) {
			const aggregatedValues = companyInsiderInformation?.reduce(
				(acc, item) => {
					acc.totalMspr += item.mspr;
					acc.totalChange += item.change;

					if (item.mspr > 0) acc.positiveMspr += item.mspr;
					if (item.mspr < 0) acc.negativeMspr += item.mspr;
					if (item.change > 0) acc.positiveChange += item.change;
					if (item.change < 0) acc.negativeChange += item.change;

					return acc;
				},
				{
					totalMspr: 0,
					positiveMspr: 0,
					negativeMspr: 0,
					totalChange: 0,
					positiveChange: 0,
					negativeChange: 0,
				}
			);

			setTotals(aggregatedValues);
		}
	}, [companyInsiderInformation]);

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
		if (stockInfo) {
			navigate(`/search/${inputValue}`);
		}
	}, [stockInfo, inputValue, navigate]);

	const handleSubmit = (event) => {
		event.preventDefault();
		performSearch();
	};

	const handleSuggestionClick = (suggestion) => {
		setShowSuggestions(false);
		setInputValue(suggestion.symbol);
		setSuggestions([]);
		performSearchWithSymbol(suggestion.symbol);
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

	const options = {
		chart: {
			type: 'line',
			backgroundColor: '#f4f4f4',
			color: 'green',
		},
		title: {
			text: `${stockInfo?.ticker} Hourly Price Variation`
		},
		xAxis: {
			type: 'datetime',
			title: {
				text: ''
			}
		},
		yAxis: {
			title: {
				text: ''
			},
			opposite: true
		},
		series: [{
			name: `${stockInfo?.ticker} Stock Price`,
			data: hourlyData,
			// data: [
			// 	[Date.UTC(2024, 1, 16, 12), 183.0],
			// 	[Date.UTC(2024, 1, 16, 13), 183.5],
			// 	[Date.UTC(2024, 1, 16, 14), 184.5],
			// 	[Date.UTC(2024, 1, 16, 15), 185.0],
			// 	[Date.UTC(2024, 1, 16, 16), 184.0],
			// 	[Date.UTC(2024, 1, 16, 17), 183.5],
			// 	[Date.UTC(2024, 1, 16, 18), 182.5]
			// ]
		}]
	}

	const recommendationTrendsOptions = {
		chart: {
			type: 'column',
			backgroundColor: '#f4f4f4',
		},
		title: {
			text: 'Recommendation Trends'
		},
		xAxis: {
			categories: ['2024-02', '2024-01', '2023-12', '2023-11']
		},
		yAxis: {
			min: 0,
			title: {
				text: 'Number of Analysts'
			}
		},
		series: [{
			name: 'Strong Buy',
			data: [2, 3, 3, 2]
		}, {
			name: 'Buy',
			data: [13, 13, 13, 13]
		}, {
			name: 'Hold',
			data: [19, 22, 23, 21]
		}, {
			name: 'Sell',
			data: [12, 12, 12, 13]
		}]
	};

	const historicalEPSSurprisesOptions = {
		chart: {
			type: "line",
			backgroundColor: '#f4f4f4',
		},
		title: {
			text: 'Historical EPS Surprises'
		},
		yAxis: {
			title: {
				text: 'Quarterly EPS'
			}
		},
		xAxis: {
			categories: ['2023-12-31', '2023-09-30', '2023-06-30', '2023-03-31']
		},
		series: [{
			name: 'Actual',
			data: [2.25, 2.0, 1.75, 1.5]
		}, {
			name: 'Estimate',
			data: [1.25, 1.5, 1.75, 2.0]
		}]
	};

	return (
		<>
			<div className="main-content">
				<h1>STOCK SEARCH</h1>
				<form action="" onSubmit={handleSubmit} className="search-box mt-5">
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
					<button onClick={performSearch}><i className="bi bi-search" style={{ fontSize: '1rem' }}></i></button>
					<button onClick={() => clearPage()} className='me-3'><i className="bi bi-x" style={{ fontSize: '2rem' }}></i></button>
				</form>
				{
					stockInfo ?
						<>
							<div className="company-details mt-3">
								<Row>
									<Col className='text-center'>
										<Row>
											<h1>{stockInfo?.ticker} <i className="bi bi-star"></i> <i className="bi bi-star-fill" style={{ color: '#E2FC38' }}></i></h1>
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
									Market closed on date
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
												<HighchartsReact
													highcharts={Highcharts}
													options={options}
												/>
												<div className="chart-placeholder">AAPL Hourly Price Variation</div>
											</Col>
										</Row>
									</Tab>
									<Tab eventKey="news" title="Top News" transition={false} key="news">
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
										<h2>Insider Sentiments</h2>
										<Table bordered>
											<thead>
												<tr>
													<th>{stockInfo?.name}</th>
													<th>MSPR</th>
													<th>Change</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>Total</td>
													<td>{roundNumber(totals.totalMspr)}</td>
													<td>{roundNumber(totals.totalChange)}</td>
												</tr>
												<tr>
													<td>Positive</td>
													<td>{roundNumber(totals.positiveMspr)}</td>
													<td>{roundNumber(totals.positiveChange)}</td>
												</tr>
												<tr>
													<td>Negative</td>
													<td>{roundNumber(totals.negativeMspr)}</td>
													<td>{roundNumber(totals.negativeChange)}</td>
												</tr>
											</tbody>
										</Table>
										<Row className="charts-container">
											<Col className="recommendation-trends">
												<h3>Recommendation Trends</h3>
												<HighchartsReact highcharts={Highcharts} options={recommendationTrendsOptions} />
											</Col>
											<Col className="eps-surprises">
												<h3>Historical EPS Surprises</h3>
												<HighchartsReact highcharts={Highcharts} options={historicalEPSSurprisesOptions} />
											</Col>
										</Row>
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
						ticker ?
							<div className="error-message">
								No data found. Please enter a valid Ticker
							</div>
							:
							<></>
				}
			</div>
		</>
	)
}

export default Search