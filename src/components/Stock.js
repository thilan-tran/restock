import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  Dropdown,
  Menu,
  Button,
  Col,
  Row,
  Card,
  Statistic,
  Icon,
  Skeleton,
  Radio,
  PageHeader,
  Slider,
  InputNumber,
  Select
} from 'antd';
import {
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

import StockService from '../services/StockService';
import { useField } from '../hooks/hooks';
import { createTransaction } from '../actions/users';
import { initOverview, addTracking } from '../actions/tracking';

export const StockOverview = ({ stock }) => {
  const change = stock.price - stock.prev_price;
  const percentChange = (change / stock.price) * 100;
  return (
    <Col xs={24} sm={24} md={12} lg={8} xl={8} style={{ padding: '8px' }}>
      <Link to={'/stocks/' + stock.symbol}>
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
const BaseSliderInput = ({
  symbol,
  min,
  max,
  history,
  auth,
  createTransaction
}) => {
  const [value, setValue] = useState(150);
  const [type, setType] = useState('long');

  const onMenuClick = (e) => {
    console.log(e);
    if (!auth.token) {
      history.push('/login');
    }

    const newTransaction = {
      symbol,
      shares: Number(value),
      short: e.key === 'longBuy' ? false : true
    };
    createTransaction(newTransaction, auth.token);
  };

  return (
    <div>
      <Row align="middle">
        <Col span={15}>
          <Slider
            min={min}
            max={max}
            onChange={(val) => setValue(val)}
            value={value}
          />
        </Col>
        <Col span={3}>
          <InputNumber
            min={min}
            max={max}
            onChange={(val) => setValue(val)}
            value={value}
          />
        </Col>
        <Col span={2}>
          <Select defaultValue={type} onChange={(type) => setType(type)}>
            <Select.Option value="long">Long</Select.Option>
            <Select.Option value="short">Short</Select.Option>
          </Select>
        </Col>
        <Col span={4}>
          <Button.Group>
            <Button type="primary">Buy</Button>
            <Button>Sell</Button>
          </Button.Group>
        </Col>
      </Row>
    </div>
  );
};
const mapStateToProps = (state) => ({
  auth: state.auth,
  tracking: state.tracking,
  init: state.overviewInitialized
});

const mapDispatchToProps = { addTracking, createTransaction, initOverview };

const SliderInput = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(BaseSliderInput)
);

const BaseStockView = (props) => {
  const [stockHistory, setHistory] = useState({});
  const [tab, setTab] = useState('quarterHour');

  useEffect(() => {
    props.addTracking(props.symbol);
    StockService.getBySymbol(props.symbol).then((data) => {
      console.log(data);
      setHistory(data);
    });
  }, []);

  const tracked = props.tracking.find((stock) => stock.symbol === props.symbol);
  if (!stockHistory.quarter_hour_data || !tracked) return <Skeleton active />;

  const hourData = stockHistory.quarter_hour_data.map((elem, ind, arr) => {
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
  hourData.reverse();

  const dayData = stockHistory.day_data.map((elem) => {
    const time = moment(new Date(elem.day + 'T00:00:00').getTime());

    return {
      ...elem,
      time: time.format('MMM D ddd').toUpperCase()
    };
  });
  dayData.reverse();

  const tabList = [
    {
      key: 'quarterHour',
      tab: 'By Quarter Hour'
    },
    {
      key: 'day',
      tab: 'By Day'
    }
  ];

  return (
    <div>
      <StockOverview stock={tracked} />
      <Col xs={24} sm={24} md={12} lg={16} xl={16} style={{ padding: '8px' }}>
        <Card title="Transactions" style={{ minHeight: '175px' }}>
          <Card.Meta description="Shares:" />
          <SliderInput min={0} max={2000} symbol={props.symbol} />
        </Card>
      </Col>
      <Col span={24} style={{ padding: '8px' }}>
        <Card
          title="History"
          tabList={tabList}
          activeTabKey={tab}
          onTabChange={(key) => setTab(key)}
        >
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart data={tab === 'quarterHour' ? hourData : dayData}>
              <CartesianGrid strokeDasharray="5 5" vertical={false} />
              <XAxis
                name="Time"
                dataKey="time"
                axisLine={false}
                tickLine={false}
                interval={0}
                tickFormatter={(time) => {
                  if (tab === 'quarterHour') {
                    const hourMin = Number(
                      time.substr(4, 2) + time.substr(7, 2)
                    );

                    if (hourMin === 945)
                      return time.split(' ')[0].toUpperCase();
                  } else {
                    const dayOfMonth = Number(time.split(' ')[1]);
                    const weekday = time.split(' ')[2];

                    if (dayOfMonth <= 6 && weekday === 'MON')
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
                // domain={[
                //   (dataMin) => dataMin - 0.1 * dataMin,
                //   (dataMax) => dataMax + 0.1 * dataMax
                // ]}
              />
              <Tooltip
                separator=" "
                formatter={(val, name, props) => ['$' + val, 'PRICE']}
              />
              <Area
                type="monotone"
                dataKey="close"
                dot={false}
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

  return (
    <div>
      {props.tracking.map((s) => (
        <StockOverview key={s.symbol} stock={s} />
      ))}
    </div>
  );
};

export const StockList = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseStockList);

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
