import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

import {
  Table,
  Popconfirm,
  Breadcrumb,
  Cascader,
  Empty,
  Dropdown,
  Menu,
  Button,
  Col,
  Row,
  Card,
  Statistic,
  Input,
  Icon,
  Skeleton,
  Radio,
  PageHeader,
  Slider,
  InputNumber,
  Select
} from 'antd';

import StockService from '../services/StockService';
import { useField } from '../hooks/hooks';
import { createTransaction, removeTransaction } from '../actions/users';
import { initOverview, addTracking } from '../actions/tracking';
import { portfolioColumns } from './tabs';

export const StockOverview = ({ stock }) => {
  const change = stock.price - stock.prev_price;
  const percentChange = (change / stock.prev_price) * 100;

  return (
    <Col xs={24} sm={24} md={12} lg={8} xl={8} style={{ padding: '8px' }}>
      <Link to={'/stocks/' + stock.symbol.toLowerCase()}>
        <Card title={stock.symbol.toUpperCase()} hoverable>
          <Card.Meta
            description={
              stock.company
                ? stock.company.length > 50
                  ? stock.company.substr(0, 50) + '...'
                  : stock.company
                : stock.symbol.toUpperCase()
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
                value={change}
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

const BaseSliderInput = ({
  symbol,
  limits,
  price,
  defaultVal,
  history,
  balance,
  auth,
  createTransaction,
  removeTransaction
}) => {
  const [value, setValue] = useState(defaultVal);
  const [cost, setCost] = useState(defaultVal * price);
  const [type, setType] = useState('long');
  const [transactType, setTransactType] = useState('buy');

  const onMenuClick = () => {
    if (!auth.token) {
      history.push('/login');
    } else {
      const newTransaction = {
        symbol,
        shares: Number(value),
        short: type === 'long' ? false : true
      };
      if (transactType === 'buy') {
        createTransaction(newTransaction, auth.token);
      } else {
        removeTransaction(newTransaction, auth.token);
      }
    }
  };

  const min = 1;
  let max = 2000;

  if (transactType === 'sell' && type === 'long') max = limits.longShares;
  else if (transactType === 'sell' && type === 'short')
    max = limits.shortShares;
  else if (transactType === 'buy') max = Math.trunc(balance / price);

  return (
    <div>
      <Row type="flex" justify="space-between" align="middle">
        <Col span={10}>
          <Slider
            min={min}
            max={max}
            onChange={(val) => {
              setValue(val);
              setCost(val * price);
            }}
            value={value}
            tipFormatter={(val) => `${val} shares`}
          />
        </Col>
        <Col span={12} style={{ textAlign: 'center' }}>
          <Input.Group>
            <InputNumber
              min={min}
              max={max}
              onChange={(val) => {
                setValue(val);
                setCost(val * price);
              }}
              value={value}
              style={{ width: '80px' }}
            />
            <InputNumber
              min={min * price}
              max={max * price}
              onChange={(val) => {
                const amount = Math.trunc(val / price);
                setCost(amount * price);
                setValue(amount);
              }}
              value={cost}
              formatter={(val) => `$${val}`}
              precision={2}
              parser={(val) => val.replace('$', '')}
              style={{ width: '110px' }}
            />
            <Select
              defaultValue={type}
              onChange={(type) => setType(type)}
              style={{ width: '80px' }}
            >
              <Select.Option value="long">Long</Select.Option>
              <Select.Option value="short">Short</Select.Option>
            </Select>
            <Select
              defaultValue={transactType}
              onChange={(type) => setTransactType(type)}
              style={{ width: '80px' }}
            >
              <Select.Option value="buy">Buy</Select.Option>
              <Select.Option value="sell">Sell</Select.Option>
            </Select>
          </Input.Group>
        </Col>
        <Col span={2}>
          <Popconfirm
            placement="topRight"
            title={`${
              transactType === 'buy' ? 'Buy' : 'Sell'
            } ${value} shares for a total of $${cost}, with a new balance of $${
              transactType === 'buy'
                ? (balance - cost).toFixed(2)
                : (balance + cost).toFixed(2)
            }?`}
            onConfirm={onMenuClick}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" disabled={Number(value) === 0}>
              Confirm
            </Button>
          </Popconfirm>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  tracking: state.tracking,
  subscribed: state.subscribed,
  init: state.overviewInitialized
});

const mapDispatchToProps = {
  addTracking,
  createTransaction,
  removeTransaction,
  initOverview
};

const SliderInput = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(BaseSliderInput)
);

const BaseStockView = (props) => {
  const [stockHistory, setHistory] = useState({});
  const [dataTab, setDataTab] = useState('days');
  const [transactTab, setTransactTab] = useState('data');

  useEffect(() => {
    props.addTracking(props.symbol);
    StockService.getBySymbol(props.symbol).then((data) => setHistory(data));
  }, []);

  const tracked = props.tracking.find((stock) => stock.symbol === props.symbol);

  if (!stockHistory.quarter_hour_data || !tracked)
    return (
      <div>
        <Col xs={24} sm={24} md={12} lg={8} xl={8} style={{ padding: '8px' }}>
          <Card>
            <Skeleton active />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12} lg={16} xl={16} style={{ padding: '8px' }}>
          <Card>
            <Skeleton active />
          </Card>
        </Col>
        <Col span={24} style={{ padding: '8px' }}>
          <Card style={{ minHeight: 500 }}>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </Card>
        </Col>
      </div>
    );

  const dayData = stockHistory.quarter_hour_data.map((elem) => {
    const time = moment(
      new Date(
        elem.time.split(' ')[0] + 'T' + elem.time.split(' ')[1]
      ).getTime()
    );
    return {
      ...elem,
      time: time.format('ddd HH:mm').toUpperCase()
    };
  });
  dayData.reverse();

  const monthData = stockHistory.day_data.map((elem) => {
    const time = moment(new Date(elem.day + 'T00:00:00').getTime());
    return {
      ...elem,
      time: time.format('MMM D ddd').toUpperCase()
    };
  });
  monthData.reverse();

  const dataTabList = [
    {
      key: 'days',
      tab: 'Days'
    },
    {
      key: 'months',
      tab: 'Months'
    }
  ];

  const transactTabList = [
    {
      key: 'data',
      tab: 'Data'
    },
    {
      key: 'history',
      tab: 'History'
    }
  ];

  const loggedUser = props.subscribed.find(
    (user) => user.id === props.auth.userId
  );

  const portfolioData = loggedUser
    ? loggedUser.portfolio.filter((stock) => stock.symbol === props.symbol)
    : [];

  const longAsset = portfolioData.find((data) => !data.short);
  const longShares = longAsset ? longAsset.shares : 0;
  const shortAsset = portfolioData.find((data) => data.short);
  const shortShares = shortAsset ? shortAsset.shares : 0;

  const data = portfolioData.length ? (
    <div>
      <Table
        columns={portfolioColumns}
        dataSource={portfolioData}
        pagination={false}
        rowKey={(record) => record.id}
      />
      <br />
      <SliderInput
        symbol={props.symbol}
        price={tracked.price}
        defaultVal={tracked.ask_size}
        balance={loggedUser.balance}
        limits={{ longShares, shortShares }}
      />
    </div>
  ) : (
    <Empty />
  );

  const transactionTabs = { data };

  return (
    <div>
      <StockOverview stock={tracked} />

      <Col xs={24} sm={24} md={12} lg={16} xl={16} style={{ padding: '8px' }}>
        {props.auth.userId ? (
          <Card
            title="TRANSACTIONS"
            tabList={transactTabList}
            activeTabKey={transactTab}
            onTabChange={(key) => setTransactTab(key)}
          >
            {transactionTabs[transactTab]}
          </Card>
        ) : (
          <Card title="TRANSACTIONS">
            <Empty
              description={
                <span>
                  <Link to="/login">Log in</Link> for transactions.
                </span>
              }
            />
          </Card>
        )}
      </Col>

      <Col span={24} style={{ padding: '8px' }}>
        <Card
          title="HISTORY"
          tabList={dataTabList}
          activeTabKey={dataTab}
          onTabChange={(key) => setDataTab(key)}
        >
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart data={dataTab === 'days' ? dayData : monthData}>
              <CartesianGrid strokeDasharray="5 5" vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                interval={0}
                tickFormatter={(time) => {
                  if (dataTab === 'days') {
                    const hourMin = Number(
                      time.substr(4, 2) + time.substr(7, 2)
                    );

                    if (hourMin === 945)
                      return time.split(' ')[0].toUpperCase();
                  } else {
                    const dayOfMonth = Number(time.split(' ')[1]);
                    const weekday = time.split(' ')[2];

                    if (dayOfMonth <= 7 && weekday === 'MON')
                      return time.split(' ')[0].toUpperCase();
                  }
                  return '';
                }}
              />

              <YAxis
                type="number"
                tickLine={false}
                interval={0}
                domain={[
                  (dataMin) => dataMin * 0.98,
                  (dataMax) => dataMax * 1.02
                ]}
                tickFormatter={(val) => '$' + val.toFixed(2)}
              />

              <Tooltip
                separator=" "
                formatter={(val) => ['$' + val.toFixed(2), 'PRICE']}
              />

              <Area
                type="monotone"
                dataKey="close"
                fill="#ccc"
                activeDot={{ r: 8, strokeWidth: 2 }}
                strokeWidth={4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </Col>
    </div>
  );
};

export const StockView = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseStockView);

const BaseStockList = (props) => {
  const [option, setOption] = useState(['activity', 'decreasing']);

  useEffect(() => {
    props.initOverview();
  }, []);

  if (!props.init)
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

  const options = [
    {
      value: 'price',
      label: 'Price',
      children: [
        {
          value: 'decreasing',
          label: 'Decreasing'
        },
        {
          value: 'increasing',
          label: 'Increasing'
        }
      ]
    },
    {
      value: 'activity',
      label: 'Activity',
      children: [
        {
          value: 'decreasing',
          label: 'Decreasing'
        },
        {
          value: 'increasing',
          label: 'Increasing'
        }
      ]
    },
    {
      value: 'change',
      label: 'Daily Change',
      children: [
        {
          value: 'decreasing',
          label: 'Decreasing'
        },
        {
          value: 'increasing',
          label: 'Increasing'
        }
      ]
    }
  ];

  const compare = {
    price: {
      decreasing: (a, b) => b.price - a.price,
      increasing: (a, b) => a.price - b.price
    },
    activity: {
      decreasing: (a, b) =>
        Math.abs(((b.price - b.prev_price) / b.prev_price) * 100) -
        Math.abs(((a.price - a.prev_price) / a.prev_price) * 100),
      increasing: (a, b) =>
        Math.abs(((a.price - a.prev_price) / a.prev_price) * 100) -
        Math.abs(((b.price - b.prev_price) / b.prev_price) * 100)
    },
    change: {
      decreasing: (a, b) =>
        ((b.price - b.prev_price) / b.prev_price) * 100 -
        ((a.price - a.prev_price) / a.prev_price) * 100,
      increasing: (a, b) =>
        ((a.price - a.prev_price) / a.prev_price) * 100 -
        ((b.price - b.prev_price) / b.prev_price) * 100
    }
  };

  const sorted = props.tracking;
  sorted.sort(compare[option[0]][option[1]]);

  return (
    <div>
      <Row type="flex" align="middle">
        <Col span={20}>
          <Breadcrumb style={{ margin: '16px' }}>
            <Breadcrumb.Item>
              <Link to="/stocks">Stocks</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Market Overview</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col span={4}>
          <Cascader
            options={options}
            onChange={(val) => setOption(val)}
            placeholder="Sort by"
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
      {sorted.map((s) => (
        <StockOverview key={s.symbol} stock={s} />
      ))}
    </div>
  );
};

// export const StockList = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(BaseStockList);

// const BaseStockDetail = ({ stock, auth, createTransaction }) => {
//   const shares = useField('number');
//   const shorts = useField('number');

//   const handleSharesClick = () => {
//     const newTransaction = {
//       symbol: stock.info.symbol,
//       shares: Number(shares.value),
//       short: false
//     };
//     createTransaction(newTransaction, auth.token);
//   };

//   const handleShortsClick = () => {
//     const newTransaction = {
//       symbol: stock.info.symbol,
//       shares: Number(shorts.value),
//       short: true
//     };
//     createTransaction(newTransaction, auth.token);
//   };

//   const handleTracking = () => {
//     addTracking(stock.info.symbol, auth.token);
//   };

//   if (!stock.info) return <div></div>;

//   return (
//     <div>
//       <h3>{stock.info.symbol}</h3>
//       <p>Current price: {stock.quarter_hour_data[0].close}</p>
//       <input {...shares} />
//       <button onClick={handleSharesClick}>buy shares</button>
//       <input {...shorts} />
//       <button onClick={handleShortsClick}>buy short</button>
//       <button onClick={handleTracking}>track</button>
//     </div>
//   );
// };

// const StockDetail = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(BaseStockDetail);

export const StockSearch = () => {
  const [searchData, setData] = useState([]);

  const handleSearch = (search) => {
    StockService.getSearchResults(search).then((data) => setData(data));
  };

  return (
    <div>
      <Row type="flex" justify="center">
        <Col span={16} style={{ margin: '25px' }}>
          <Input.Search
            placeholder="Search"
            size="large"
            onSearch={handleSearch}
          />
        </Col>
      </Row>
      {searchData.length ? (
        searchData.map((result) => (
          <Col
            key={result.symbol}
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={8}
            style={{ padding: '8px' }}
          >
            <Link to={'/stocks/' + result.symbol.toLowerCase()}>
              <Card title={result.symbol} hoverable>
                <Card.Meta
                  description={
                    result.company
                      ? result.company.length > 50
                        ? result.company.substr(0, 50) + '...'
                        : result.company
                      : result.symbol.toUpperCase()
                  }
                />
              </Card>
            </Link>
          </Col>
        ))
      ) : (
        <Empty />
      )}
    </div>
  );
};
