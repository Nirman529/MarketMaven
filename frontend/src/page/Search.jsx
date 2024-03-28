import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPortfolioData, addToPortfolio, removeFromPortfolio, getWatchlistData, removeFromWatchlist, addToWatchlist, getStockInfo, getCompanyLatestPriceOfStock, loadSuggestions, getCompanyPeers, getNews, getCompanyInsiderInformation, getHourlyData, getRecommendationData, getHistoricalData, getEarningsData, getWalletBalance, depositToWallet, withdrawFromWallet } from "../api/api.js";
import { TailSpin } from 'react-loader-spinner';
import { Form, Table, Row, Col, Button, Tabs, Tab, Card, Modal, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "bootstrap/dist/css/bootstrap.min.css";
import MainCharts from './MainCharts.jsx';

// import { useSearch } from '../SearchContext.js';

const Search = () => {
	// const { searchData, setSearchData } = useSearch();
	let { ticker } = useParams();
	const navigate = useNavigate();
	let [inputValue, setInputValue] = useState("");
	let [stockInfo, setStockInfo] = useState(null);
	let [companyPeers, setCompanyPeers] = useState(null);
	let [companyLatestPriceOfStock, setCompanyLatestPriceOfStock] = useState(null);
	let [news, setNews] = useState([]);
	let [selectedNews, setSelectedNews] = useState(null);
	let [suggestions, setSuggestions] = useState([]);
	let [showSuggestions, setShowSuggestions] = useState(false);
	let [isLoading, setIsLoading] = useState(false);
	let [showModal, setShowModal] = useState(false);
	let [arrowIcon, setArrowIcon] = useState(null);
	let [priceColor, setPriceColor] = useState('');
	let [isInWatchlist, setIsInWatchlist] = useState(false);
	let [companyInsiderInformation, setCompanyInsiderInformation] = useState(null);
	let [hourlyData, setHourlyData] = useState(null);
	let [recommendationData, setRecommendationData] = useState(null);
	let [historicalData, setHistoricalData] = useState(null);
	let [earningsData, setEarningsData] = useState(null);
	let [portfolioData, setPortfolioData] = useState({});
	let [quantity, setQuantity] = useState(0);
	let [buyTotals, setBuyTotals] = useState(0);
	let [mainLoading, setMainLoading] = useState("");
	const [showErrorAlert, setShowErrorAlert] = useState(false);
	const [errorAlertMessage, setErrorAlertMessage] = useState('');
	let [totals, setTotals] = useState({
		totalMspr: 0,
		positiveMspr: 0,
		negativeMspr: 0,
		totalChange: 0,
		positiveChange: 0,
		negativeChange: 0,
	});
	const [buyModal, setBuyModal] = useState(false)
	const [sellModal, setSellModal] = useState(false)
	const [isStockInPortfolio, setIsStockInPortfolio] = useState(false);
	const [balance, setBalance] = useState(null);

	const twitterBaseUrl = "https://twitter.com/intent/tweet";
	const tweetText = encodeURIComponent(selectedNews?.headline);
	const tweetUrl = encodeURIComponent(selectedNews?.url);
	const twitterShareUrl = `${twitterBaseUrl}?text=${tweetText}&url=${tweetUrl}`;
	const groupingUnits = [['week', [1]], ['month', [1, 2, 3, 4, 6]]];
	const getMarketStatus = (timestamp) => {
		const currentTime = new Date();
		const marketTimestamp = new Date(timestamp * 1000);
		const differenceInSeconds = (currentTime - marketTimestamp) / 1000;
		return (
			<>
				{
					differenceInSeconds < 60
						? <div className='text-success'>Market is Open</div>
						: <div className='text-danger'>Market Closed on {getUnixDate(timestamp)}</div>
				}
			</>
		);
	}

	const performSearchWithSymbol = useCallback(async (symbol) => {
		if (!symbol) {
			console.log("Please enter a ticker symbol to search.");
			return;
		}
		setMainLoading(true);

		try {
			// Construct an array of promises for the various data fetches
			const dataFetchPromises = [
				getStockInfo(symbol),
				getCompanyLatestPriceOfStock(symbol),
				getCompanyPeers(symbol),
				getNews(symbol),
				getCompanyInsiderInformation(symbol),
				getHourlyData(symbol),
				getRecommendationData(symbol),
				getEarningsData(symbol),
				getWalletBalance()
			];

			// Destructure the resolved values from the promises
			const [
				_stockInfo,
				_companyLatestPriceOfStock,
				_companyPeers,
				_news,
				_companyInsiderInformation,
				_hourlyData,
				_recommendationData,
				_earningsData,
				_walletBalance
			] = await Promise.all(dataFetchPromises);

			// Set the state for each piece of data
			setStockInfo(_stockInfo?.data);
			setCompanyLatestPriceOfStock(_companyLatestPriceOfStock.data);
			setCompanyPeers(_companyPeers?.data);
			setNews(_news?.data);
			setCompanyInsiderInformation(_companyInsiderInformation?.data.data);
			setHourlyData(convertData(_hourlyData?.data.results));
			setRecommendationData(_recommendationData?.data);
			// setHistoricalData(_historicalData?.data.results);
			setEarningsData(processedHistoricalData(_earningsData?.data));
			const isPriceUp = _companyLatestPriceOfStock.data?.d > 0;
			setPriceColor(isPriceUp ? 'green' : 'red');
			setArrowIcon(isPriceUp ? <i className="bi bi-caret-up-fill"></i> : <i className="bi bi-caret-down-fill"></i>);
			setBalance(_walletBalance.balance);

			// Additional checks for watchlist and portfolio
			checkIfInWatchlist(symbol);
			checkIfInPortfolio(symbol);
			if (!_stockInfo?.data) {
				setShowErrorAlert(true);
				setErrorAlertMessage('No data found. Please enter a valid Ticker');
			} else {
				setShowErrorAlert(false);
			}
		} catch (error) {
			setShowErrorAlert(true);
			console.error('Error fetching stock info:', error);
		} finally {
			setMainLoading(false);
		}
	}, []);


	useEffect(() => {
		const fetchLatestPrice = async () => {
			try {
				const latestPriceData = await getCompanyLatestPriceOfStock(ticker);
				setCompanyLatestPriceOfStock(latestPriceData.data);
			} catch (error) {
				console.error('Error fetching latest stock price:', error);
			}
		};
		fetchLatestPrice();
		getMarketStatus(companyLatestPriceOfStock?.t);
		const intervalId = setInterval(fetchLatestPrice, 15000);
		return () => clearInterval(intervalId);
	}, [ticker]);

	useEffect(() => {
		if (ticker) {
			performSearchWithSymbol(ticker);
		}
	}, [ticker, performSearchWithSymbol]);

	// useEffect(() => {
	// 	if (ticker) {
	// 		performSearchWithSymbol(ticker);
	// 	} else {
	// 		navigate("../");
	// 	}
	// }, [ticker, navigate]);

	const checkIfInPortfolio = async (ticker) => {
		try {
			const portfolioData = await getPortfolioData();
			const stockInPortfolio = portfolioData.data.some(stock => stock.ticker === ticker.toUpperCase());
			setIsStockInPortfolio(stockInPortfolio);
		} catch (error) {
			console.error("Error checking portfolio:", error);
		}
	};


	const processedHistoricalData = (data) => {
		return data.map(item => {
			return {
				x: new Date(item.period),
				y: item.actual,
				estimate: item.estimate
			};
		});
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
		} else {

			navigate(`/search/${inputValue}`)
		}
	}

	const triggerSearch = (currentValue) => {
		performSearchWithSymbol(currentValue);
	};

	useEffect(() => {
		const fetchWatchlist = async () => {
			try {
				getWatchlistData();
			} catch (error) {
				console.error("Error fetching watchlist:", error);
			}
		};

		if (stockInfo) {
			fetchWatchlist();
		}
	}, [stockInfo]);

	// useEffect(() => {
	// 	if (searchTrigger) {
	// 		performSearchWithSymbol(searchTrigger);
	// 	}
	// }, [searchTrigger]);

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
		if (stockInfo && inputValue) {
			navigate(`/search/${inputValue}`);
		}
	}, [stockInfo, inputValue, navigate]);

	const handleSubmit = (event) => {
		event.preventDefault();
		const upper = inputValue.toUpperCase();
		setInputValue(upper);
		triggerSearch(upper);
	};

	const handleSuggestionClick = (suggestion) => {
		const upper = suggestion;
		setInputValue(upper);
		triggerSearch(upper);
	};

	const isValid = (item) => {
		const requirement = ['image', 'headline'];
		return requirement.every(key => item[key] !== undefined && item[key] !== "");
	}

	const autoComplete = (e) => {
		setInputValue(e.target.value.toUpperCase());
		setShowSuggestions(true);
	}

	const clearPage = () => {
		setInputValue('')
		setStockInfo(null)
	}

	const getUnixDate = (unixTimestamp) => {
		const date = new Date(unixTimestamp * 1000);
		const year = date.getFullYear();
		const month = ('0' + (date.getMonth() + 1)).slice(-2);
		const day = ('0' + date.getDate()).slice(-2);

		const hours = ('0' + date.getHours()).slice(-2);
		const minutes = ('0' + date.getMinutes()).slice(-2);
		const seconds = ('0' + date.getSeconds()).slice(-2);

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

	const volume = historicalData?.map(item => {
		return [item.t, item.v]
	});

	const stock_price = historicalData?.map(item => {
		return [item.t, item.c]
	});

	const hourlyPriceOptions = {
		chart: {
			type: 'line',
			backgroundColor: '#f4f4f4',
		},
		plotOptions: {
			series: {
				color: priceColor,
			}
		},
		title: {
			text: `${stockInfo?.ticker} Hourly Price Variation`
		},
		tooltip: {
			formatter: function () {
				return `${stockInfo?.ticker}:${this.y}`
			}
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
			opposite: true,
			align: 'right'
		},
		series: [{
			labels: 'left',
			showInLegend: false,
			name: `${stockInfo?.ticker} Stock Price`,
			data: hourlyData,
			marker: {
				enabled: false
			}
		}]
	}

	const recommendationTime = recommendationData?.map(item => item.period.slice(0, 7));

	const series = [
		{
			name: 'Strong Buy',
			data: recommendationData?.map(item => item?.strongBuy),
			stack: 'recommendations',
			color: '#195f32'
		},
		{
			name: 'Buy',
			data: recommendationData?.map(item => item?.buy),
			stack: 'recommendations',
			color: '#23af50'
		},
		{
			name: 'Hold',
			data: recommendationData?.map(item => item?.hold),
			stack: 'recommendations',
			color: '#af7d28'
		},
		{
			name: 'Sell',
			data: recommendationData?.map(item => item?.sell),
			stack: 'recommendations',
			color: '#f05050'
		},
		{
			name: 'Strong Sell',
			data: recommendationData?.map(item => item?.strongSell),
			stack: 'recommendations',
			color: '#732828'
		},
	];

	const recommendationTrendsOptions = {
		chart: {
			type: 'column',
			backgroundColor: '#f4f4f4',
		},
		title: {
			text: 'Recommendation Trends',
			align: 'center'
		},
		legend: {
			enabled: true
		},
		xAxis: {
			categories: recommendationTime,
		},
		yAxis: {
			min: 0,
			title: {
				text: '#Analysis',
			},
			stackLabels: {
				enabled: false
			}
		},
		tooltip: {
			headerFormat: '<b>{point.x}</b><br/>',
			pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
		},
		plotOptions: {
			column: {
				stacking: 'normal',
				dataLabels: {
					enabled: true
				}
			}
		},
		series: series,
	};

	const historicalEPSSurprisesOptions = {
		chart: {
			type: 'spline',
			inverted: false,
			backgroundColor: '#f4f4f4',
		},
		title: {
			text: 'Historical EPS Surprises',
			align: 'center'
		},
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: {
				day: '%Y-%m-%d'
			},
			labels: {
				// formatter: function () {
				// 	// Use 'pos' as an index if it corresponds with your sorted data array
				// 	const index = this.pos;

				// 	// Make sure index is within the bounds of the earningsData array
				// 	if (index < 0 || index >= earningsData.length) {
				// 		return ''; // Return an empty string or some default HTML as fallback
				// 	}

				// 	const surprise = earningsData[index].surprisePercent.toFixed(2); // Assuming surprisePercent is a number
				// 	const periodLabel = `<div style="text-align: center;">${Highcharts.dateFormat('%Y-%m-%d', earningsData[index].period)}</div>`;
				// 	const surpriseLabel = `<div style="text-align: center;">Surprise: ${surprise}%</div>`;

				// 	return periodLabel + surpriseLabel;
				// },



				// formatter: function () {
				//     const index = this.pos;
				//     const surprise = earningsData[index].surprisePercent;
				//     const periodLabel = <div style="text-align: center;">${this.value}</div>;
				//     const surpriseLabel = <div style="text-align: center;">Surprise: ${surprise}%</div>;
				//     return ${periodLabel}${surpriseLabel};
				// },


				formatter: function () {
					const point = earningsData.find(p => new Date(p.period).getTime() === this.value);
					// const surprise = earningsData.find(p => p.surprise)

					return `<span>${Highcharts.dateFormat('%Y-%m-%d', this.value)}</span><br/><span>${!point ? point?.surprise.toFixed(2) : ''}</span>`;
				},
				useHTML: true,
				style: {
					textAlign: 'center'
				}
			},
		},
		yAxis: {
			title: {
				text: 'Quarterly EPS'
			}
		},
		legend: {
			enabled: true
		},
		tooltip: {
			formatter: function () {
				const date = Highcharts.dateFormat('%Y-%m-%d', this.x);
				return `<b>Date:</b> ${date}<br/>
					  <b>Actual:</b> ${this.y}<br/>
					  <b>Estimate:</b> ${this.point.estimate}`;
			}
		},
		plotOptions: {
			spline: {
				marker: {
					enable: true
				}
			}
		},
		series: [{
			name: 'Actual',
			data: earningsData,
			marker: {
				fillColor: 'blue',
				lineWidth: 2,
				lineColor: null
			}
		}, {
			name: 'Estimate',
			data: earningsData?.map(point => {
				return {
					x: point.x,
					y: point.estimate
				};
			}),
			marker: {
				fillColor: 'blue',
				lineWidth: 2,
				lineColor: null
			}
		}]
	};

	const handleQuantityChange = (e) => {
		const qty = Number(e.target.value);
		setQuantity(qty);
		setBuyTotals(roundNumber(qty * companyLatestPriceOfStock?.c));
	};

	const handleBuy = async () => {
		if (!quantity || quantity <= 0 || !stockInfo) {
			console.log("Invalid quantity or stock information missing");
			return;
		}

		const purchasePrice = Number(companyLatestPriceOfStock?.c);
		const totalCost = purchasePrice * quantity;

		try {
			const withdrawResponse = await withdrawFromWallet(totalCost);
			if (!withdrawResponse || withdrawResponse.error) {
				throw new Error('Could not withdraw from wallet');
			}
			const ticker = stockInfo?.ticker;
			const name = stockInfo?.name;
			await addToPortfolio(ticker, name, quantity, purchasePrice);
		} catch (error) {
			console.error("Transaction failed:", error);
		}
		setQuantity(0);
		setBuyModal(!buyModal);
	};

	const handleSell = async () => {
		if (!quantity || quantity <= 0 || !stockInfo) {
			console.log("Invalid quantity or stock information missing");
			return;
		}

		const sellPrice = Number(companyLatestPriceOfStock?.c);
		const totalProceeds = sellPrice * quantity;
		try {
			const depositResponse = await depositToWallet(totalProceeds);
			if (depositResponse.error) {
				throw new Error('Could not deposit into wallet');
			}
			const ticker = stockInfo?.ticker;
			await removeFromPortfolio(ticker, quantity, sellPrice);
		} catch (error) {
			console.error("Transaction failed:", error);
		}
		setQuantity(0);
		setSellModal(!sellModal);
	};
	const checkIfInWatchlist = async (tick) => {
		try {
			const watchlistData = await getWatchlistData();
			const stockInWatchlist = watchlistData.data.some(stock => stock.ticker === tick);
			setIsInWatchlist(stockInWatchlist);
		} catch (error) {
			console.error("Error checking watchlist:", error);
		}
	};

	const handleAddToWatchlist = async (ticker, name) => {
		try {
			await addToWatchlist(ticker, name);
			checkIfInWatchlist(ticker);
		} catch (error) {
			console.error('Failed to add to watchlist:', error);
		}
	};

	const handleRemoveFromWatchlist = async (ticker) => {
		try {
			await removeFromWatchlist(ticker);
			checkIfInWatchlist(ticker);
		} catch (error) {
			console.error('Failed to remove from watchlist:', error);
		}
	};

	const buyOptions = () => {
		return <>
			{isStockInPortfolio ?
				(
					<>
						<Button className='btn btn-success me-3 px-3' onClick={() => setBuyModal(!buyModal)}>Buy</Button>
						<Button className='btn btn-danger px-3' onClick={() => setSellModal(!sellModal)}>sell</Button>
					</>
				)
				:
				(
					<Button className='btn btn-success me-3 px-3' onClick={() => setBuyModal(!buyModal)}>Buy</Button>
				)
			}
			<Modal show={buyModal}>
				<Modal.Header >
					<Modal.Title className='flex-grow-1'>{stockInfo?.ticker}</Modal.Title>
					<button className="clear-background" onClick={() => setBuyModal(!buyModal)}>x</button>
				</Modal.Header>
				<Modal.Body className='fw-bold'>
					<div className='m-0'>Current Price: {roundNumber(companyLatestPriceOfStock?.c)}</div>
					<div className='m-0'>Money in Wallet: ${balance}</div>

					<Form.Group as={Row} className='m-0 my-1 align-items-center' controlId="formQuantity">
						Quantity:
						<Col>
							<Form.Control
								type="number"
								value={quantity}
								onChange={handleQuantityChange}
								min="1"
								step="1"
							/>
						</Col>
					</Form.Group>
					{
						companyLatestPriceOfStock?.c * quantity > balance ? <div className='text-danger'>Not enough money in wallet!</div> : <></>
					}
				</Modal.Body>
				<Modal.Footer className='d-flex justify-content-between align-items-center'>
					<p className='text-start'>Total: {buyTotals.toFixed(2)}</p>
					<Button className='btn btn-success me-3 px-3' onClick={handleBuy} disabled={companyLatestPriceOfStock?.c * quantity > balance}>
						Buy
					</Button>
				</Modal.Footer>
			</Modal>
			<Modal show={sellModal}>
				<Modal.Header>
					<Modal.Title className='flex-grow-1'>{stockInfo?.ticker}</Modal.Title>
					<button className="clear-background" onClick={() => setSellModal(!sellModal)}>x</button>
				</Modal.Header>
				<Modal.Body className='fw-bold'>
					<div className='m-0'>Current Price: {roundNumber(companyLatestPriceOfStock?.c)}</div>
					<div className='m-0'>Money in Wallet: ${balance}</div>
					<Form.Group as={Row} className="m-0 my-1 align-items-center">
						Quantity:
						<Col>
							<Form.Control
								type="number"
								value={quantity}
								onChange={handleQuantityChange}
								min="1"
								step="1"
							/>
						</Col>
					</Form.Group>
					{
						// quantity > selectedStock?.quantity ? <div className='text-danger'>You cannot sell the stocks you don't have!</div> : <></>
					}
				</Modal.Body>
				<Modal.Footer className='d-flex justify-content-between align-items-center'>
					<p className='text-start'>Total: {buyTotals.toFixed(2)}</p>
					<Button className='btn btn-success px-3' onClick={handleSell}>
						Sell
					</Button>
				</Modal.Footer>
			</Modal>
		</>;
	}

	const searchTicker = (e) => {
		try {
			setInputValue(e);
		} catch (error) {
			console.log('error', error)
		} finally {
			performSearchWithSymbol(inputValue);
		}
	}

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
								setTimeout(() => setShowSuggestions(false), 100);
							}}
						/>
						{showSuggestions && suggestions?.length > 0 ? (
							<ul className="suggestions-list ms-3 m-0 p-0">
								{suggestions?.slice(0, 5).map((suggestion, index) => (
									<li className='' key={index} onClick={(suggestion) => handleSuggestionClick(suggestion.symbol)}>
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
				{showErrorAlert && (
					<Alert variant="danger" onClose={() => setShowErrorAlert(false)} dismissible>
						{errorAlertMessage}
					</Alert>
				)}
				{
					stockInfo ?
						<>
							<div className="company-details mt-3">
								<Row className='m-0 p-0'>
									<Col className='text-center'>
										<Row>
											<h1>
												{stockInfo?.ticker}
												{!isInWatchlist ? (
													<i className="bi bi-star ms-3 pointer" onClick={() => handleAddToWatchlist(stockInfo?.ticker, stockInfo?.name)}></i>
												) : (
													<i className="bi bi-star-fill ms-3 pointer" onClick={() => handleRemoveFromWatchlist(stockInfo?.ticker)} style={{ color: '#F3D520' }}></i>
												)}
											</h1>
											<h3>{stockInfo?.name}</h3>
											<div>{stockInfo?.exchange}</div>
											<div>
												{buyOptions()}
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
									{getMarketStatus(companyLatestPriceOfStock?.t)}
								</Row>
							</div>
							<div className="company-dashboard">
								<Tabs defaultActiveKey="summary" id="company-dashboard" transition={false} className="tabs mb-3" justify>
									<Tab eventKey="summary" title="Summary" transition={false}>
										<Row className='m-0 p-0'>
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
														<p className='mt-2'>{companyPeers?.map((item, key) => {
															// return <a key={item} onClick={() => searchTicker(item)}>{item}, </a>
															return <span key={item} className='anchor-tag' onClick={() => searchTicker(item)}>{item}, </span>;
														})}</p>
													</Col>
												</Row>
											</Col>
											<Col md={6}>
												<HighchartsReact
													highcharts={Highcharts}
													options={hourlyPriceOptions}
												/>
											</Col>
										</Row>
									</Tab>
									<Tab eventKey="news" title="Top News" transition={false} key="news">
										<Row>
											{news?.slice(0, 20).map((item, key) => {
												return <Col md={6} className="mb-4 hover-effect" key={key}>
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
											})}
										</Row>
									</Tab>
									<Tab eventKey="charts" title="Charts" transition={false}>
										<Col className="recommendation-trends">
											<MainCharts />
										</Col>
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
													<td className='fw-bold'>Total</td>
													<td>{roundNumber(totals.totalMspr)}</td>
													<td>{roundNumber(totals.totalChange)}</td>
												</tr>
												<tr>
													<td className='fw-bold'>Positive</td>
													<td>{roundNumber(totals.positiveMspr)}</td>
													<td>{roundNumber(totals.positiveChange)}</td>
												</tr>
												<tr>
													<td className='fw-bold'>Negative</td>
													<td>{roundNumber(totals.negativeMspr)}</td>
													<td>{roundNumber(totals.negativeChange)}</td>
												</tr>
											</tbody>
										</Table>
										<Row className="charts-container">
											<Col className="recommendation-trends">
												<HighchartsReact highcharts={Highcharts} options={recommendationTrendsOptions} />
											</Col>
											<Col className="eps-surprises">
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
						<></>
				}
			</div>
		</>
	)
}

export default Search