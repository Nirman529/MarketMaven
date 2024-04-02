import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { getWalletBalance, getPortfolioData, getCompanyLatestPriceOfStock, depositToWallet, withdrawFromWallet, removeFromPortfolio, addToPortfolio } from '../api/api.js';
import { useNavigate } from 'react-router-dom';

const Portfolio = () => {
	const navigate = useNavigate();
	const [portfolioData, setPortfolioData] = useState([]);
	const [balance, setBalance] = useState(null);
	const [selectedStock, setSelectedStock] = useState(null);
	const [quantity, setQuantity] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [showAlert, setShowAlert] = useState(false);
	const [modalInfo, setModalInfo] = useState({ show: false, type: '' });
	const [alert, setAlert] = useState({ show: false, message: '', variant: '' });

	useEffect(() => {
		setIsLoading(true);
		const fetchPortfolioData = async () => {
			try {
				const [walletData, portfolioResponse] = await Promise.all([
					getWalletBalance(),
					getPortfolioData(),
				]);

				setBalance(walletData.balance);

				const portfolioWithDetails = portfolioResponse.data.length === 0 ? [] :
					await Promise.all(portfolioResponse.data.map(async (stock) => {
						const stockDetails = await getCompanyLatestPriceOfStock(stock.ticker);
						return { ...stock, ...stockDetails.data };
					}));

				setPortfolioData(portfolioWithDetails);
				setShowAlert(portfolioResponse.data.length === 0);
			} catch (error) {
				console.error("Error fetching portfolio data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPortfolioData();
	}, []);

	const roundNumber = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

	const handleBuySellAction = async (type) => {
		const price = Number(selectedStock?.c);
		const totalAmount = price * quantity;
		const isBuyAction = type === 'buy';

		try {
			const response = isBuyAction
				? await withdrawFromWallet(totalAmount)
				: await depositToWallet(totalAmount);

			if (response.error) throw new Error('Transaction failed');

			const actionPromise = isBuyAction
				? addToPortfolio(selectedStock?.ticker, selectedStock?.name, quantity, price)
				: removeFromPortfolio(selectedStock?.ticker, quantity, price);

			await actionPromise;
			await refetchData();

			setAlert({
				show: true,
				message: `${selectedStock?.ticker} ${isBuyAction ? 'bought' : 'sold'} successfully.`,
				variant: isBuyAction ? 'success' : 'danger',
			});

			setTimeout(() => {
				setAlert({ show: false, message: '', variant: '' });
			}, 3000);
		} catch (error) {
			console.error(error.message || "An error occurred during the transaction");
		}

		setQuantity(0);
		setModalInfo({ show: false, type: '' });
	};

	const refetchData = async () => {
		setIsLoading(true);
		try {
			const [walletData, portfolioResponse] = await Promise.all([
				getWalletBalance(),
				getPortfolioData(),
			]);

			setBalance(walletData.balance);

			const portfolioWithDetails = await Promise.all(portfolioResponse.data.map(async (stock) => {
				const stockDetails = await getCompanyLatestPriceOfStock(stock.ticker);
				return { ...stock, ...stockDetails.data };
			}));

			setPortfolioData(portfolioWithDetails);
			setShowAlert(portfolioResponse.data.length === 0);
		} catch (error) {
			console.error("Error refetching portfolio data:", error);
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<div className='m-3 main-content'>
			{alert.show && (
				<Alert
					variant={alert.variant}
					onClose={() => setAlert({ ...alert, show: false })}
					dismissible
				>
					{alert.message}
				</Alert>
			)}
			<h2 className='text-start'>My Portfolio</h2>
			<h3 className='text-start'>Money in wallet: ${balance ? balance.toFixed(2) : 'Loading...'}</h3>

			{isLoading ? (
				<div className="text-center">
					<Spinner animation="border" />
				</div>
			) : (
				<div className="portfolio-container">
					{portfolioData && portfolioData.length > 0 ? (
						portfolioData.map((stock, key) => {
							const change = roundNumber(stock.c * stock.quantity - stock.avgCost * stock.quantity);
							const changeClass = change > 0 ? 'text-green' : change < 0 ? 'text-red' : 'text-black';

							return <Card key={key} className="mb-3">
								<Card.Header className='text-start' style={{ cursor: 'pointer' }} onClick={() => navigate(`/search/${stock.ticker}`)}>
									<span style={{ fontWeight: 'bold', fontSize: '30px' }}>
										{stock.ticker}{" "}
									</span>
									<span>
										{stock.name}
									</span>
								</Card.Header>
								<Card.Body className='p-0 text-start'>
									<Row className='m-2 p-0'>
										<Col sm={3}>
											<Card.Text className='m-0 mx-3'>Quantity: </Card.Text>
											<Card.Text className='m-0 mx-3'>Avg. Cost / Share: </Card.Text>
											<Card.Text className='m-0 mx-3'>Total Cost: </Card.Text>
										</Col>
										<Col sm={3}>
											<Card.Text className='m-0'>{stock.quantity}</Card.Text>
											<Card.Text className='m-0'>{stock.avgCost.toFixed(2)}</Card.Text>
											<Card.Text className='m-0'>{stock.totalCost.toFixed(2)}</Card.Text>
										</Col>
										<Col sm={3}>
											<Card.Text className='m-0'>Change: </Card.Text>
											<Card.Text className='m-0'>Current Price: </Card.Text>
											<Card.Text className='m-0'>Market Value: </Card.Text>
										</Col>
										<Col sm={3}>
											<Card.Text className={`m-0 ${changeClass}`}>
												{stock.c - stock.avgCost > 0 ? (
													<i className="bi bi-caret-up-fill" style={{ color: 'green' }}></i>
												) : stock.c - stock.avgCost < 0 ? (
													<i className="bi bi-caret-down-fill" style={{ color: 'red' }}></i>
												) : null}
												{roundNumber(stock.c - stock.avgCost)}
											</Card.Text>
											<Card.Text className={`m-0 ${changeClass}`}>{stock.c}</Card.Text>
											<Card.Text className={`m-0 ${changeClass}`}>{roundNumber(stock.c * stock.quantity)}</Card.Text>
										</Col>
									</Row>
									<Card.Footer className='m-0'>
										<Button className='btn btn-primary me-2' onClick={() => {
											setSelectedStock(stock);
											setModalInfo({ show: true, type: 'buy' });
										}}>Buy</Button>
										<Button className='btn btn-danger' onClick={() => {
											setSelectedStock(stock);
											setModalInfo({ show: true, type: 'sell' });
										}}>Sell</Button>
									</Card.Footer>
								</Card.Body>

							</Card>
						})
					) : showAlert && (
						<Alert variant="warning">
							Currently, you don't have any stocks.
						</Alert>
					)}
				</div>
			)
			}

			<Modal show={modalInfo.show}>
				<Modal.Header>
					<Modal.Title className='flex-grow-1'>{selectedStock?.ticker}</Modal.Title>
					<button className="clear-background" onClick={() => setModalInfo({ show: false, type: '' })}>x</button>
				</Modal.Header>
				<Modal.Body className='fw-bold'>
					<div>Current Price: {selectedStock ? roundNumber(selectedStock.c).toFixed(2) : 'Loading...'}</div>
					<div>Money in Wallet: ${roundNumber(balance)}</div>
					<Form.Group as={Row} className="align-items-center">
						<Form.Label column sm={3}>Quantity:</Form.Label>
						<Col sm={9}>
							<Form.Control
								type='Number'
								value={quantity}
								onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
								min="0"
								step="1"
							/>
						</Col>
					</Form.Group>
					{modalInfo.type === 'buy' && selectedStock?.c * quantity > balance && (
						<div className='text-danger'>Not enough money in wallet!</div>
					)}
					{modalInfo.type === 'buy' && quantity < 0 && (
						<div className='text-danger'>Cannot buy non-positive shares.</div>
					)}
					{modalInfo.type === 'sell' && quantity > selectedStock?.quantity && (
						<div className='text-danger'>Cannot sell more than you own!</div>
					)}
					{modalInfo.type === 'sell' && quantity < 0 && (
						<div className='text-danger'>Cannot sell non-positive shares.</div>
					)}
				</Modal.Body>
				<Modal.Footer className='d-flex justify-content-between align-items-center'>
					<p className='text-start'>Total: {roundNumber(selectedStock?.c * quantity)}</p>

					<Button
						variant={modalInfo.type === 'buy' ? 'primary' : 'danger'}
						onClick={() => handleBuySellAction(modalInfo.type)}
						disabled={modalInfo.type === 'buy' ? selectedStock?.c * quantity > balance : quantity > selectedStock?.quantity}
					>
						{modalInfo.type === 'buy' ? 'Buy' : 'Sell'}
					</Button>
				</Modal.Footer>
			</Modal>
		</div >
	);
};
export default Portfolio;