import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Col, Card, Statistic, Icon, Skeleton, PageHeader, Slider } from 'antd';
import { Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts';

import StockService from '../services/StockService';
import { useField } from '../hooks/hooks';
import { createTransaction, addTracking } from '../actions/users';

export const StockOverview = ({ stock }) => {
  const change = stock.price - stock.prev_price;
  const percentChange = (change / stock.price) * 100;
  return (
    <Col xs={24} sm={24} md={12} lg={8} xl={8} style={{ padding: '8px' }}>
      <Link to={'/stocks/' + stock.symbol}>
        <Card title={stock.symbol.toUpperCase()} hoverable>
          <Card.Meta
            description={
              stock.company.length > 50
                ? stock.company.substr(0, 50) + '...'
                : stock.company
            }
          />
          <br />
          <div style={{ fontSize: '8px' }}>
            <Col span={12}>
              <Statistic
                value={stock.price}
                precision={2}
                prefix={<Icon type="dollar" />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                value={Math.abs(change)}
                precision={2}
                valueStyle={{
                  color: change >= 0 ? '#3f8600' : '#cf1322'
                }}
                prefix={<Icon type={change >= 0 ? 'arrow-up' : 'arrow-down'} />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                value={percentChange}
                precision={2}
                valueStyle={{
                  color: percentChange >= 0 ? '#3f8600' : '#cf1322'
                }}
                prefix={
                  <Icon type={percentChange >= 0 ? 'arrow-up' : 'arrow-down'} />
                }
                suffix="%"
              />
            </Col>
          </div>
        </Card>
      </Link>
    </Col>
  );
};

export const StockView = (props) => {
  const [stockHistory, setHistory] = useState({});
  const [value, setValue] = useState(0);

  useEffect(() => {
    StockService.getBySymbol(props.symbol).then((data) => {
      console.log(data);
      setHistory(data);
    });
  }, []);

  if (!stockHistory.quarter_hour_data) return <Skeleton active />;

  return (
    <Card>
      <Slider
        min={0}
        max={2000}
        onChange={(val) => setValue(val)}
        value={value}
      />
      <LineChart
        width={1000}
        height={500}
        data={stockHistory.quarter_hour_data}
      >
        <YAxis
          type="number"
          domain={[
            Math.min(...stockHistory.quarter_hour_data) - 50,
            Math.max(...stockHistory.quarter_hour_data) + 50
          ]}
        />
        <XAxis dataKey="timestamp" />
        <Tooltip />
        <Line type="monotone" dataKey="close" />
      </LineChart>
    </Card>
  );
};

export const StockList = ({ stocks }) => {
  if (stocks.length < 12)
    return (
      <div>
        {[...Array(12).keys()].map((elem) => (
          <Col
            key={elem}
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={8}
            style={{ padding: '8px' }}
          >
            <Card>
              <Skeleton active />
            </Card>
          </Col>
        ))}
      </div>
    );

  return (
    <div>
      {stocks.map((s) => (
        <StockOverview key={s.symbol} stock={s} />
      ))}
    </div>
  );
};

const BaseStockDetail = ({ stock, auth, createTransaction }) => {
  const shares = useField('number');
  const shorts = useField('number');

  const handleSharesClick = () => {
    const newTransaction = {
      symbol: stock.info.symbol,
      shares: Number(shares.value),
      short: false
    };
    createTransaction(newTransaction, auth.token);
  };

  const handleShortsClick = () => {
    const newTransaction = {
      symbol: stock.info.symbol,
      shares: Number(shorts.value),
      short: true
    };
    createTransaction(newTransaction, auth.token);
  };

  const handleTracking = () => {
    addTracking(stock.info.symbol, auth.token);
  };

  if (!stock.info) return <div></div>;

  return (
    <div>
      <h3>{stock.info.symbol}</h3>
      <p>Current price: {stock.quarter_hour_data[0].close}</p>
      <input {...shares} />
      <button onClick={handleSharesClick}>buy shares</button>
      <input {...shorts} />
      <button onClick={handleShortsClick}>buy short</button>
      <button onClick={handleTracking}>track</button>
    </div>
  );
};

const mapStateToProps = (state) => ({ auth: state.auth });

const mapDispatchToProps = { createTransaction };

const StockDetail = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseStockDetail);

export const StockSearch = () => {
  const search = useField('text');
  const [symbolData, setData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    StockService.getBySymbol(search.value).then((data) => setData(data));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Search Stocks</h2>
        <div>
          Symbol:
          <input {...search} />
        </div>
        <button type="submit">search</button>
      </form>
      <StockDetail stock={symbolData} />
    </div>
  );
};
