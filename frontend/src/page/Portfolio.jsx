import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Modal, Form } from 'react-bootstrap';
import { getWalletBalance, getPortfolioData, getCompanyLatestPriceOfStock, depositToWallet, withdrawFromWallet, removeFromPortfolio, addToPortfolio } from '../api/api.js';

const Portfolio = () => {
	const [portfolioData, setPortfolioData] = useState([]);
	const [balance, setBalance] = useState(null);
	const [buyModal, setBuyModal] = useState(false);
	const [sellModal, setSellModal] = useState(false);
	const [quantity, setQuantity] = useState(0);
	const [selectedStock, setSelectedStock] = useState(null);
	const [buyTotals, setBuyTotals] = useState(0);
	const [sellTotals, setSellTotals] = useState(0);

	const roundNumber = (num) => {
		return Math.round((num + Number.EPSILON) * 100) / 100;
	}
	useEffect(() => {
		const fetchPortfolioData = async () => {
			try {
				const portfolioResponse = await getPortfolioData();
				const portfolio = portfolioResponse.data;

				const portfolioWithDetails = await Promise.all(portfolio.map(async (stock) => {
					const stockDetails = await getCompanyLatestPriceOfStock(stock.ticker); // Assume getStockInfo returns additional details for a stock
					return { ...stock, ...stockDetails.data };
				}));
				const walletData = await getWalletBalance();

				setPortfolioData(portfolioWithDetails);
				if (walletData) {
					setBalance(walletData.balance);
				}
				console.log('portfolioData', portfolioData)
			} catch (error) {
				console.error("Error fetching portfolio data:", error);
			}
		};

		fetchPortfolioData();
		console.log('portfolioData', portfolioData)
	}, []);


	const handleBuy = async () => {
		if (!quantity || quantity <= 0 || !selectedStock) {
			console.log("Invalid quantity or stock information missing");
			return;
		}

		const purchasePrice = Number(selectedStock?.c);
		const totalCost = purchasePrice * quantity;

		try {
			const withdrawResponse = await withdrawFromWallet(totalCost);
			if (!withdrawResponse || withdrawResponse.error) {
				throw new Error('Could not withdraw from wallet');
			}
			const ticker = selectedStock?.ticker;
			const name = selectedStock?.name;
			await addToPortfolio(ticker, name, quantity, purchasePrice);
			console.log("Stock purchased and added to portfolio");
		} catch (error) {
			console.error("Transaction failed:", error);
		}
		setQuantity(0);
		setBuyModal(!buyModal);
	};

	const handleSell = async () => {
		if (!quantity || quantity <= 0 || !selectedStock) {
			console.log("Invalid quantity or stock information missing");
			return;
		}

		const sellPrice = Number(selectedStock?.c);
		const totalProceeds = sellPrice * quantity;
		try {
			const depositResponse = await depositToWallet(totalProceeds);
			console.log('depositResponse', depositResponse)
			if (depositResponse.error) {
				throw new Error('Could not deposit into wallet');
			}
			const ticker = selectedStock?.ticker;
			await removeFromPortfolio(ticker, quantity, sellPrice);
			console.log("Stock sold and portfolio updated");
		} catch (error) {
			console.error("Transaction failed:", error);
		}
		setQuantity(0);
		setSellModal(!sellModal);
	};

	const buyStock = (stock) => {
		setSelectedStock(stock);
		setBuyModal(!buyModal);
	}

	const sellStock = (stock) => {
		setSelectedStock(stock);
		setSellModal(!sellModal);
	}

	const handleQuantityChange = (e) => {
		const qty = Number(e.target.value);
		setQuantity(qty);

		const buyTotals = qty * roundNumber(selectedStock?.c);
		setBuyTotals(qty * selectedStock?.c);
	};
	return (
		<div className='m-3'>
			<h2>My Portfolio</h2>
			<h3>Money in wallet: ${balance}</h3>
			<div className="portfolio-container">
				{portfolioData?.map((stock, key) => {
					return <Card key={key} className="mb-3">
						<Card.Body className='p-0'>
							<Card.Title className='m-3 bg-light'>{stock.ticker} - {stock.name}</Card.Title>
							<Row>
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
									<Card.Text className='m-0'>{roundNumber(stock.avgCost - stock.c)}</Card.Text>
									<Card.Text className='m-0'>{stock.c}</Card.Text>
									<Card.Text className='m-0'>{stock.c * stock.quantity}</Card.Text>
								</Col>
							</Row>
							<Card.Footer className='m-0'>
								<Button className='btn btn-primary me-2' onClick={() => buyStock(stock)}>Buy</Button>
								<Button className='btn btn-danger px-3' onClick={() => sellStock(stock)}>sell</Button>
							</Card.Footer>
						</Card.Body>
					</Card>
				})}
			</div>
			<Modal show={buyModal}>
				<Modal.Header >
					<Modal.Title className='flex-grow-1'>{selectedStock?.ticker}</Modal.Title>
					<button className="clear-background" onClick={() => setBuyModal(!buyModal)}>x</button>
				</Modal.Header>
				<Modal.Body className='fw-bold'>
					<div className='m-0'>Current Price: {roundNumber(selectedStock?.c)}</div>
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
						selectedStock?.c * quantity > balance ? <div className='text-danger'>Not enough money in wallet!</div> : <></>
					}
				</Modal.Body>
				<Modal.Footer className='d-flex justify-content-between align-items-center'>
					<p className='text-start'>Total: {roundNumber(selectedStock?.c * quantity)}</p>
					<Button className='btn btn-success me-3 px-3' onClick={() => handleBuy()} disabled={selectedStock?.c * quantity > balance}>
						Buy
					</Button>
				</Modal.Footer>
			</Modal>


			<Modal show={sellModal}>
				<Modal.Header >
					<Modal.Title className='flex-grow-1'>{selectedStock?.ticker}</Modal.Title>
					<button className="clear-background" onClick={() => setSellModal(!sellModal)}>x</button>
				</Modal.Header>
				<Modal.Body className='fw-bold'>
					<div className='m-0'>Current Price: {roundNumber(selectedStock?.c)}</div>
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
						quantity > selectedStock?.quantity ? <div className='text-danger'>You cannot sell the stocks you don't have!</div> : <></>
					}
				</Modal.Body>
				<Modal.Footer className='d-flex justify-content-between align-items-center'>
					<p className='text-start'>Total: {selectedStock?.c * quantity}</p>
					<Button className='btn btn-success px-3' onClick={handleSell} disabled={quantity > selectedStock?.quantity}>
						Sell
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};
export default Portfolio;