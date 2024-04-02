import React, { useEffect, useState } from 'react'
import { removeFromWatchlist, getWatchlistData, getCompanyLatestPriceOfStock } from '../api/api';
import { Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Watchlist = () => {
	const navigate = useNavigate();
	const [stockInfo, setStockInfo] = useState([]);
	const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
	const [loading, setLoading] = useState(false);

	const fetchWatchlistAndStockInfo = async () => {
		setLoading(true);
		try {
			const watchlistDataResponse = await getWatchlistData();
			const _watchlistData = watchlistDataResponse.data;
			const stockInfoPromises = _watchlistData.map(async (item) => {
				try {
					const latestPriceResponse = await getCompanyLatestPriceOfStock(item.ticker);
					const latestPriceData = latestPriceResponse?.data;
					return { ...item, ...latestPriceData };
				} catch (error) {
					console.error(`Error fetching additional info for ticker ${item.ticker}:`, error);
					return item;
				}
			});
			const _stockInfo = await Promise.all(stockInfoPromises);
			setStockInfo(_stockInfo);
			if (_stockInfo?.length === 0) {
				setAlert({ show: true, message: 'Your watchlist is empty.', variant: 'warning' });
			}
		} catch (error) {
			console.error("Error fetching watchlist or stock info:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchWatchlistAndStockInfo();
	}, []);

	const handleRemoveFromWatchlist = async (ticker) => {
		setLoading(true);
		try {
			await removeFromWatchlist(ticker);
			await fetchWatchlistAndStockInfo();
			setStockInfo(currentStockInfo => currentStockInfo.filter(item => item.ticker !== ticker));
		} catch (error) {
			console.error('Failed to remove from watchlist:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='main-content mx-3'>
			<Col>
				<h2 className='m-3 text-start mb-3 mt-3'>My Watchlist</h2>
				{alert.show && <Alert variant={alert.variant} onClose={() => setAlert({ ...alert, show: false })}>{alert.message}</Alert>}
				{loading ? (
					<Spinner animation="border" role="status">
						<span className="visually-hidden">Spinner Loading</span>
					</Spinner>
				) : (
					stockInfo?.map((item, key) => (
						<Card className="mb-3" key={key}>
							<Card.Header className='no-background-border m-0 p-0'>
								<div className='btn btn-clear remove-watchlist' onClick={() => handleRemoveFromWatchlist(item?.ticker)}>x</div>
							</Card.Header>
							<Card.Body onClick={() => navigate(`/search/${item.ticker}`)} style={{ cursor: 'pointer' }}>
								<Row className='m-0 p-0 text-start'>
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
					))
				)}
			</Col>
		</div>
	)
}

export default Watchlist