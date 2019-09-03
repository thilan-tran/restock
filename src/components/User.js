import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { LineChart, Line } from 'recharts';
import {
  Timeline,
  Avatar,
  PageHeader,
  Card,
  Row,
  Col,
  Statistic,
  Icon,
  Table,
  Tag,
  Tooltip,
  Empty,
  Skeleton
} from 'antd';

import {
  initLeaderboard,
  addSubscribed,
  removeSubscribed
} from '../actions/users';

export const UserOverview = ({ user }) => {
  const [tab, setTab] = useState('overview');

  const dailyRecords = user.records.daily_records;
  const latestValue = dailyRecords[dailyRecords.length - 1].value;

  const change = user.value - latestValue;
  const percentChange = (change / latestValue) * 100;

  const monthlyRecords = user.records.monthly_records;
  const oldestValue = monthlyRecords[0].value;

  const overallChange = user.value - oldestValue;
  const overallPercentChange = (overallChange / oldestValue) * 100;

  const overview = (
    <Row>
      <Col span={6}>
        <Statistic
          title="Balance"
          value={user.balance}
          precision={2}
          prefix={<Icon type="dollar" />}
        />
      </Col>
      <Col span={6}>
        <Statistic
          title="Value"
          value={user.value}
          precision={2}
          prefix={<Icon type="dollar" />}
        />
      </Col>
      <Col span={6}>
        <span>
          <Statistic
            title="Daily Change"
            value={change}
            precision={2}
            valueStyle={{
              color:
                change > 0 ? '#3f8600' : change === 0 ? '#595959' : '#cf1322'
            }}
            prefix={
              <Icon
                type={
                  change > 0 ? 'arrow-up' : change === 0 ? 'line' : 'arrow-down'
                }
              />
            }
          />
          <Statistic
            value={percentChange}
            precision={4}
            valueStyle={{
              color:
                percentChange > 0
                  ? '#3f8600'
                  : percentChange === 0
                  ? '#595959'
                  : '#cf1322'
            }}
            prefix={
              <Icon
                type={
                  percentChange > 0
                    ? 'arrow-up'
                    : percentChange === 0
                    ? 'line'
                    : 'arrow-down'
                }
              />
            }
            suffix="%"
          />
        </span>
      </Col>
      <Col span={6}>
        <span>
          <Statistic
            title="Overall Change"
            value={overallChange}
            precision={2}
            valueStyle={{
              color:
                overallChange > 0
                  ? '#3f8600'
                  : overallChange === 0
                  ? '#595959'
                  : '#cf1322'
            }}
            prefix={
              <Icon
                type={
                  overallChange > 0
                    ? 'arrow-up'
                    : overallChange === 0
                    ? 'line'
                    : 'arrow-down'
                }
              />
            }
          />
          <Statistic
            value={overallPercentChange}
            precision={4}
            valueStyle={{
              color:
                overallPercentChange > 0
                  ? '#3f8600'
                  : overallPercentChange === 0
                  ? '#595959'
                  : '#cf1322'
            }}
            prefix={
              <Icon
                type={
                  overallPercentChange > 0
                    ? 'arrow-up'
                    : overallPercentChange === 0
                    ? 'line'
                    : 'arrow-down'
                }
              />
            }
            suffix="%"
          />
        </span>
      </Col>
    </Row>
  );

  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text) => <Link to={'/stocks/' + text}>{text.toUpperCase()}</Link>
    },
    {
      title: 'Shares',
      dataIndex: 'shares',
      key: 'shares',
      render: (text) => (
        <Statistic value={text} prefix={<Icon type="pie-chart" />} />
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => (
        <Statistic value={text} precision={2} prefix={<Icon type="dollar" />} />
      )
    },
    {
      title: 'Type',
      key: 'type',
      render: (text, record) => (
        <span>
          {record.short ? (
            <Tooltip title="Short stocks increase in value if their price decreases.">
              <Tag color="orange">short</Tag>
            </Tooltip>
          ) : (
            <Tooltip title="Short stocks increase in value if their price decreases.">
              <Tag color="purple">long</Tag>
            </Tooltip>
          )}
          {record.purchase ? (
            <Tag color="blue">buy</Tag>
          ) : (
            <Tag color="red">sell</Tag>
          )}
        </span>
      )
    },
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp'
    }
  ];

  const transactions = user.transactions.length ? (
    <Table
      columns={columns}
      dataSource={user.transactions}
      rowKey={(record) => record.id}
    />
  ) : (
    <Empty />
  );

  const portfolioColumns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text) => <Link to={'/stocks/' + text}>{text.toUpperCase()}</Link>
    },
    {
      title: 'Total Shares',
      dataIndex: 'shares',
      key: 'shares',
      render: (text) => (
        <Statistic value={text} prefix={<Icon type="pie-chart" />} />
      )
    },
    {
      title: 'Current Price',
      dataIndex: 'current_price',
      key: 'currentPrice',
      render: (text, record) => {
        // const prevTimestamp = new Date(
        //   record.prev_timestamp.split(' ')[0] +
        //     'T' +
        //     record.prev_timestamp.split(' ')[1]
        // );
        // const timestamp = new Date(
        //   record.timestamp.split(' ')[0] + 'T' + record.timestamp.split(' ')[1]
        // );

        // const priceChange =
        //   timestamp >= prevTimestamp
        //     ? 0
        //     : record.current_price - record.prev_price;

        const priceChange = record.current_price - record.prev_price;

        return (
          <span>
            <Statistic
              value={text}
              precision={2}
              prefix={<Icon type="dollar" />}
            />
            <Statistic
              value={priceChange}
              precision={2}
              valueStyle={{
                color:
                  priceChange > 0
                    ? '#3f8600'
                    : priceChange === 0
                    ? '#595959'
                    : '#cf1322'
              }}
              prefix={
                <Icon
                  type={
                    priceChange > 0
                      ? 'arrow-up'
                      : priceChange === 0
                      ? 'line'
                      : 'arrow-down'
                  }
                />
              }
            />
          </span>
        );
      }
    },
    {
      title: 'Overall Change',
      key: 'change',
      render: (text, record) => {
        // const prevTimestamp = new Date(
        //   record.prev_timestamp.split(' ')[0] +
        //     'T' +
        //     record.prev_timestamp.split(' ')[1]
        // );
        // const timestamp = new Date(
        //   record.timestamp.split(' ')[0] + 'T' + record.timestamp.split(' ')[1]
        // );

        // const initPrice =
        //   timestamp >= prevTimestamp
        //     ? 0
        //     : record.current_price - record.prev_price;

        // const initPrice = record.current_price - record.prev_price;
        // const priceChange = record.short ? -1 * initPrice : initPrice;

        // const change = priceChange * record.shares;
        // const percentChange = (priceChange / record.current_price) * 100;

        const change = record.current_price * record.shares - record.init_value;
        const percentChange = (change / record.init_value) * 100;

        return (
          <span>
            <Statistic
              value={change}
              precision={2}
              valueStyle={{
                color:
                  change > 0 ? '#3f8600' : change === 0 ? '#595959' : '#cf1322'
              }}
              prefix={
                <Icon
                  type={
                    change > 0
                      ? 'arrow-up'
                      : change === 0
                      ? 'line'
                      : 'arrow-down'
                  }
                />
              }
            />
            <Statistic
              value={percentChange}
              precision={4}
              valueStyle={{
                color:
                  percentChange > 0
                    ? '#3f8600'
                    : percentChange === 0
                    ? '#595959'
                    : '#cf1322'
              }}
              prefix={
                <Icon
                  type={
                    percentChange > 0
                      ? 'arrow-up'
                      : percentChange === 0
                      ? 'line'
                      : 'arrow-down'
                  }
                />
              }
              suffix="%"
            />
          </span>
        );
      }
    },
    {
      title: 'Type',
      key: 'type',
      render: (text, record) =>
        record.short ? (
          <Tooltip title="Short stocks increase in value if their price decreases.">
            <Tag color="orange">short</Tag>
          </Tooltip>
        ) : (
          <Tooltip title="Long stocks increase in value if their price increases.">
            <Tag color="purple">long</Tag>
          </Tooltip>
        )
    }
  ];

  const portfolio = user.portfolio.length ? (
    <Table
      columns={portfolioColumns}
      dataSource={user.portfolio}
      rowKey={(record) => record.id}
    />
  ) : (
    <Empty />
  );

  const tracking = (
    <LineChart width={300} height={100} data={user.records.latest_records}>
      <Line type="monotone" dataKey="value" />
    </LineChart>
  );

  const tabs = {
    overview,
    portfolio,
    transactions,
    tracking
  };

  return (
    <Col style={{ padding: '8px' }}>
      <Card
        hoverable
        tabList={[
          { tab: 'Overview', key: 'overview' },
          { tab: 'Portfolio', key: 'portfolio' },
          { tab: 'Transactions', key: 'transactions' },
          { tab: 'Tracking', key: 'tracking' }
        ]}
        activeTabKey={tab}
        onTabChange={(key) => setTab(key)}
      >
        <Card.Meta avatar={<Avatar icon="user" />} title={user.username} />
        <br />
        {tabs[tab]}
      </Card>
    </Col>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  leaderboard: state.leaderboard,
  subscribed: state.subscribed
});

const mapDispatchToProps = { addSubscribed, removeSubscribed, initLeaderboard };

const BaseUserView = ({
  id,
  addSubscribed,
  removeSubscribed,
  subscribed,
  socket
}) => {
  useEffect(() => {
    addSubscribed(id);

    return () => {
      removeSubscribed(id);
    };
  }, []);

  const user = subscribed.find((u) => u.id === id);
  if (!user) return <p>loading...</p>;

  const stocks = user.portfolio.map((s) => {
    console.log(s);
    const change = s.shares * (s.current_price - s.init_price);
    const percentChange = change / (s.shares * s.init_price);

    return (
      <p key={s.id}>
        {s.shares}{' '}
        <Link to={'/stocks/' + s.symbol}>{s.symbol.toUpperCase()}</Link>{' '}
        {s.short ? 'short' : 'stock'} bought for ${s.init_price}, now $
        {s.current_price} at {s.timestamp} Change: ${change.toFixed(2)}{' '}
        {percentChange.toFixed(4)}%
      </p>
    );
  });

  return (
    <div>
      <UserOverview user={user} />
      {stocks}
    </div>
  );
};

export const UserView = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseUserView);

const BaseLeaderboard = (props) => {
  // useEffect(() => {
  //   props.initLeaderboard();
  // }, []);

  if (!props.subscribed.length) return <Skeleton active />;

  return (
    <div>
      {props.subscribed.map((u) => (
        <UserOverview key={u.id} user={u} />
      ))}
    </div>
  );
};

export const Leaderboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseLeaderboard);
