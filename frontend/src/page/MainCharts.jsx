import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import vbp from 'highcharts/indicators/volume-by-price';
import apiLink from '../apiLink';
import axios from 'axios';
require("highcharts/indicators/indicators")(Highcharts);
vbp(Highcharts);

function MainCharts() {
    const { ticker } = useParams();
    const [chartData, setChartData] = useState({ ohlc: [], volume: [] });
    const groupingUnits = [['week', [1]], ['month', [1, 2, 3, 4, 6]]];

    useEffect(() => {
        fetchData();
    }, [ticker]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${apiLink}/api/historical_data?symbol=${ticker}`);
            const data = response.data;
            const ohlc = [], volume = [];
            data.forEach(entry => {
                ohlc.push([
                    entry.timestamp,
                    entry.open,
                    entry.high,
                    entry.low,
                    entry.close
                ]);
                volume.push([
                    entry.timestamp,
                    entry.volume
                ]);
            });

            setChartData({ ohlc, volume });
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };

    const options = {
        rangeSelector: {
            selected: 1
        },
        title: {
            text: 'Historical Stock Market Data'
        },
        subtitle: {
            text: 'With SMA and Volume by Price technical indicators'
        },
        rangeSelector: {
            inputEnabled: false,
            buttons: [{
                type: 'month',
                count: 1,
                text: '1m'
            }, {
                type: 'month',
                count: 3,
                text: '3m'
            }, {
                type: 'month',
                count: 6,
                text: '6m'
            }, {
                type: 'YTD',
                count: 1,
                text: 'YTD'
            }, {
                type: 'year',
                count: 1,
                text: '1y'
            }, {
                type: 'all',
                count: 1,
                text: 'All'
            }],
            selected: 2
        },
        yAxis: [{
            startOnTick: false,
            endOnTick: false,
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: 'OHLC'
            },
            height: '60%',
            lineWidth: 2,
            resize: {
                enabled: true
            }
        }, {
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: 'Volume'
            },
            top: '65%',
            height: '35%',
            offset: 0,
            lineWidth: 2
        }],

        tooltip: {
            split: true
        },
        plotOptions: {
            series: {
                dataGrouping: {
                    units: groupingUnits
                }
            }
        },
        series: [{
            type: 'candlestick',
            name: ticker,
            id: 'candleStick',
            data: chartData.ohlc
        }, {
            type: 'column',
            name: 'Volume',
            id: 'Volume',
            data: chartData.volume,
            yAxis: 1
        },
        {
            type: 'vbp',
            linkedTo: 'candleStick',
            params: {
                volumeSeriesID: 'Volume'
            },
            dataLabels: {
                enabled: false
            },
            zoneLines: {
                enabled: false
            }
        },
        {
            type: 'sma',
            linkedTo: 'candleStick',
            zIndex: 1,
            marker: {
                enabled: false
            }
        }]
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} constructorType={'stockChart'} options={options} />
        </div>
    );
}

export default MainCharts;
