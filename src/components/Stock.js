import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
  Col,
  Row,
  Breadcrumb,
  Table,
  Card,
  Statistic,
  Icon,
  Skeleton,
  Empty,
  Button,
  Slider,
  Input,
  InputNumber,
  Select,
  Cascader,
  Popconfirm,
  Tooltip,
  message,
  Spin
} from 'antd';

import { baseMenu } from './Routes';
import { ValueAreaChart } from './Recharts';
import { portfolioColumns, transactionColumns } from './Table';
import StockService from '../services/StockService';
import { createTransaction, removeTransaction } from '../actions/users';
import { initOverview, addTracking, removeTracking } from '../actions/tracking';

const formatCurrency = (value) =>
  value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

const BaseStockOverview = ({
  stock,
  expanded,
  addTracking,
  removeTracking,
  auth,
  userTracking
}) => {
  const change = stock.price - stock.prev_price;
  const percentChange = (change / stock.prev_price) * 100;

  const tracked = userTracking.includes(stock.symbol.toLowerCase());

  const onClick = () => {
    tracked
      ? removeTracking(stock.symbol.toLowerCase(), true)
      : addTracking(stock.symbol.toLowerCase(), null, true);
  };

  return (
    <Col xs={24} sm={24} md={12} lg={8} xl={8} style={{ padding: '8px' }}>
      <Link to={'/stocks/' + stock.symbol.toLowerCase()}>
        <Card
          title={stock.symbol.toUpperCase()}
          hoverable
          style={{ height: '100%' }}
        >
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
          <Col span={12}>
            <Statistic
              title="Price"
              value={stock.price}
              precision={2}
              prefix={<Icon type="dollar" />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Daily Change"
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
              title="Percent Change"
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
          {expanded ? (
            <Button
              onClick={onClick}
              style={{ width: '100%', marginTop: '30px' }}
              type={tracked ? 'danger' : 'primary'}
            >
              {tracked ? 'Untrack Stock' : 'Track Stock'}
            </Button>
          ) : (
            ''
          )}
        </Card>
      </Link>
    </Col>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  tracking: state.tracking,
  userTracking: state.userTracking,
  subscribed: state.subscribed,
  init: state.overviewInitialized
});

const mapDispatchToProps = {
  addTracking,
  removeTracking,
  createTransaction,
  removeTransaction,
  initOverview
};

export const StockOverview = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseStockOverview);

const BaseSliderInput = ({
  tracked,
  user,
  history,
  auth,
  createTransaction,
  removeTransaction
}) => {
  const { symbol, price } = tracked;
  const defaultVal = tracked.ask_size;
  const balance = user.balance;
  const longAsset = user.portfolio.find(
    (stock) => stock.symbol === symbol && !stock.short
  );
  const longShares = longAsset ? longAsset.shares : 0;
  const shortAsset = user.portfolio.find(
    (stock) => stock.symbol === symbol && stock.short
  );
  const shortShares = shortAsset ? shortAsset.shares : 0;

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

  if (transactType === 'sell' && type === 'long') max = longShares;
  else if (transactType === 'sell' && type === 'short') max = shortShares;
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
              precision={2}
              formatter={(val) => `$${formatCurrency(val)}`}
              parser={(val) => val.replace(/\$|,/g, '')}
              style={{ width: '110px' }}
            />
            <Select
              defaultValue={type}
              onChange={(type) => setType(type)}
              style={{ width: '80px' }}
            >
              <Select.Option value="long">
                <Tooltip title="Long stocks increase in value if their price increases.">
                  Long
                </Tooltip>
              </Select.Option>
              <Select.Option value="short">
                <Tooltip title="Short stocks increase in value if their price decreases.">
                  Short
                </Tooltip>
              </Select.Option>
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
            } ${value} shares for a total of $${formatCurrency(
              cost
            )}, with a new balance of $${
              transactType === 'buy'
                ? formatCurrency((balance - cost).toFixed(2))
                : formatCurrency((balance + cost).toFixed(2))
            }?`}
            onConfirm={onMenuClick}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" disabled={Number(value) <= 0}>
              Confirm
            </Button>
          </Popconfirm>
        </Col>
      </Row>
    </div>
  );
};

const SliderInput = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(BaseSliderInput)
);

const StockViewSkeleton = () => (
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

const BaseStockView = (props) => {
  const [stockHistory, setHistory] = useState({});
  const [dataTab, setDataTab] = useState('days');
  const [transactTab, setTransactTab] = useState('data');

  useEffect(() => {
    StockService.getBySymbol(props.symbol)
      .then((data) => {
        setHistory(data);
        props.addTracking(props.symbol, data.day_data[1].close);
      })
      .catch((err) => {
        console.error(err.response);
        if (err.response.status === 400) {
          message.error(
            'Requests exceeded, please try again in 10 seconds.',
            10
          );
          props.history.goBack();
        } else if (err.response.status === 404) {
          message.error(`No such stock with symbol ${props.symbol}.`, 10);
          props.history.goBack();
        }
      });

    return () => {
      props.removeTracking(props.symbol);
    };
  }, []);

  const tracked = props.tracking.find((stock) => stock.symbol === props.symbol);

  if (!stockHistory || !stockHistory.quarter_hour_data || !tracked) {
    return <StockViewSkeleton />;
    // return <Spin size="large" style={{ textAlign: 'center' }} />;
  }

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

  const data = loggedUser ? (
    portfolioData.length ? (
      <div>
        <Table
          columns={portfolioColumns(true)}
          dataSource={portfolioData}
          pagination={false}
          rowKey={(record) => record.id}
        />
        <br />
        <h3>
          <em>New Transaction</em>
        </h3>
        <Statistic
          title="Remaining Balance"
          value={loggedUser.balance}
          precision={2}
          prefix={<Icon type="dollar" />}
        />
        <SliderInput tracked={tracked} user={loggedUser} />
      </div>
    ) : (
      <div>
        <Empty description={<span>No purchased stock.</span>} />
        <br />
        <Statistic
          title="Remaining Balance"
          value={loggedUser.balance}
          precision={2}
          prefix={<Icon type="dollar" />}
        />
        <SliderInput tracked={tracked} user={loggedUser} />
      </div>
    )
  ) : (
    ''
  );

  const transactionData = loggedUser
    ? loggedUser.transactions.filter(
        (transact) => transact.symbol === props.symbol
      )
    : [];

  const history = portfolioData.length ? (
    <div>
      <Table
        columns={transactionColumns(false)}
        dataSource={transactionData}
        pagination={{ pageSize: 10, size: 'small' }}
        rowKey={(record) => record.id}
        scroll={{ y: 300 }}
      />
    </div>
  ) : (
    <Empty description={<span>No transaction history.</span>} />
  );

  const transactionTabs = { data, history };

  return (
    <div>
      <Row type="flex">
        <StockOverview stock={tracked} expanded />

        <Col xs={24} sm={24} md={12} lg={16} xl={16} style={{ padding: '8px' }}>
          {props.auth.userId ? (
            <Card
              title="TRANSACTIONS"
              tabList={transactTabList}
              activeTabKey={transactTab}
              onTabChange={(key) => setTransactTab(key)}
              style={{ height: '100%' }}
              hoverable
            >
              {transactionTabs[transactTab]}
            </Card>
          ) : (
            <Card title="TRANSACTIONS" hoverable>
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
      </Row>

      <Col span={24} style={{ padding: '8px' }}>
        <Card
          title="HISTORY"
          tabList={dataTabList}
          activeTabKey={dataTab}
          onTabChange={(key) => setDataTab(key)}
          hoverable
        >
          <ValueAreaChart
            type={dataTab}
            data={dataTab === 'days' ? dayData : monthData}
          />
        </Card>
      </Col>
    </div>
  );
};

export const StockView = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(BaseStockView)
);

const StockListSkeleton = () => (
  <div>
    <Row type="flex" align="middle">
      <Col span={20}>
        <Breadcrumb style={{ margin: '16px' }}>
          <Breadcrumb.Item overlay={baseMenu}>Stocks</Breadcrumb.Item>
          <Breadcrumb.Item>Market Overview</Breadcrumb.Item>
        </Breadcrumb>
      </Col>
    </Row>
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

const BaseStockList = (props) => {
  const [option, setOption] = useState(['activity', 'decreasing']);

  useEffect(() => {
    props.initOverview();
  }, []);

  if (!props.init) return <StockListSkeleton />;

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
            <Breadcrumb.Item overlay={baseMenu}>Stocks</Breadcrumb.Item>
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

export const StockList = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseStockList);

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
            placeholder="Search Stocks"
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
        <Empty style={{ marginTop: '150px' }} />
      )}
    </div>
  );
};
