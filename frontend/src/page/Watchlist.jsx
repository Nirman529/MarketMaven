import React, { useEffect, useState } from 'react'
import { getWatchlistData, getStockInfo } from '../api/api';

const Watchlist = () => {

	const [data, setData] = useState([]);
	const [stockInfo, setStockInfo] = useState(null);
	useEffect(() => {
		const gettingdata = async () => {
			const watchlistData = await getWatchlistData();
			
			const _stockInfo = await Promise.all(
				data.map(async (item) => {
					console.log('called', )
					const response = await getStockInfo(item);
					return await response.json();
				})
			)
			// const borderCountr = await Promise.all(
			// 	borders.map(async (border) => {
			// 	  const response = await fetch(`https://restcountries.eu/rest/v2/alpha/${border}`);
			// 	  return await response.json();
			// 	})
			//   );
			setData(watchlistData.data);
			setStockInfo(_stockInfo);
		}

		gettingdata();
	}, [])

	return (
		<>			
			<div>Watchlist</div>
			{data?.map((item, key ) => {
				return <div key={key}>
					<div key={key}>{item.ticker}</div>
				</div>
			})}
			<div>stockInfo: 	</div>
			{stockInfo?.map((item, key ) => {
				return <div key={key}>
					<div key={key}>{item.ticker}</div>
				</div>
			})}
		</>
	)
}

export default Watchlist