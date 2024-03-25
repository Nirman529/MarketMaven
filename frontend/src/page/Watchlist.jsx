import React, { useEffect, useState } from 'react'
import { removeFromWatchlist, getWatchlistData, getCompanyLatestPriceOfStock } from '../api/api';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Watchlist = () => {
	const navigate = useNavigate();
	const [stockInfo, setStockInfo] = useState([]);
	useEffect(() => {
		const fetchWatchlistAndStockInfo = async () => {
			try {
				const watchlistDataResponse = await getWatchlistData();
				const _watchlistData = watchlistDataResponse.data;
				const stockInfoPromises = _watchlistData.map(async (item) => {
					try {
						const latestPriceResponse = await getCompanyLatestPriceOfStock(item.ticker);
						const latestPriceData = latestPriceResponse.data;
						return { ...item, ...latestPriceData };
					} catch (error) {
						console.error(`Error fetching additional info for ticker ${item.ticker}:`, error);
						return item;
					}
				});
				const _stockInfo = await Promise.all(stockInfoPromises);
				setStockInfo(_stockInfo);
			} catch (error) {
				console.error("Error fetching watchlist or stock info:", error);
			}
		};
		fetchWatchlistAndStockInfo();
	}, []);

	const handleRemoveFromWatchlist = async (ticker) => {
		try {
			await removeFromWatchlist(ticker);
			setStockInfo(currentStockInfo => currentStockInfo.filter(item => item.ticker !== ticker));
		} catch (error) {
			console.error('Failed to remove from watchlist:', error);
		}
	};

	return (
		<Col className='mx-3'>
			<h2>My Watchlist</h2>
			{stockInfo?.map((item, key) => (
				<Card className="mb-3" key={key} onClick={() => navigate(`/search/${item.ticker}`)} style={{ cursor: 'pointer' }}>
					<Card.Body>
						<Button onClick={() => handleRemoveFromWatchlist(item?.ticker)}>x</Button>
						<Row className='m-0 p-0'>
							<Col>
								<h3 className="me-2">{item?.ticker}</h3>
								{item?.name}
							</Col>
							<Col className={`ms-1 ${item.d < 0 ? 'text-danger' : 'text-success'}`}>
								<div className="">
									<h3>
										{item.c ? item.c.toFixed(2) : "N/A"}
									</h3>
									<div>
										{item.d > 0 ? <i className="bi bi-caret-up-fill"></i> : <i className="bi bi-caret-down-fill"></i>}{item.d ? item.d.toFixed(2) : "N/A"} ({item.dp ? item.dp.toFixed(2) : "N/A"}%)
									</div>
								</div>
							</Col>
						</Row>
					</Card.Body>
				</Card>
			))}
		</Col>
	)
}

export default Watchlist