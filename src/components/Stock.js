import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import StockService from '../services/StockService';
import { useField } from '../hooks/hooks';
import { createTransaction, addTracking } from '../actions/users';

export const StockOverview = ({ stock }) => (
  <div>
    <Link to={'/stocks/' + stock.ticker}>
      <h3>
        {stock.ticker} {stock.companyName}
      </h3>
    </Link>
    <p>
      {stock.price} {stock.changes} {stock.changesPercentage}
    </p>
  </div>
);

export const StockView = (props) => {
  const [stockHistory, setHistory] = useState({});

  useEffect(() => {
    StockService.getBySymbol(props.symbol).then((data) => setHistory(data));
  }, []);

  const arr = stockHistory.quarter_hour_data
    ? stockHistory.quarter_hour_data.map((elem) => <p>{elem.close}</p>)
    : 'loading...';

  return <div>{arr}</div>;
};

export const StockList = ({ stocks }) => {
  if (!stocks) return <p>loading...</p>;
  return (
    <div>
      {stocks.map((s) => (
        <StockOverview key={s.ticker} stock={s} />
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
