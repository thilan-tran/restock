import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  Cascader,
  Button,
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
  Skeleton,
  Select
} from 'antd';

import {
  AreaChart,
  ScatterChart,
  Scatter,
  Area,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import moment from 'moment';

import {
  initLeaderboard,
  addSubscribed,
  removeSubscribed
} from '../actions/users';

const BaseUserOverview = ({ user, history }) => {
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
      pagination={{ pageSize: 4 }}
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
      title: 'Daily Price Change',
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

        let change = record.current_price * record.shares - record.init_value;
        change = record.short ? -1 * change : change;
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
      pagination={{ pageSize: 4 }}
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
    transactions
  };

  return (
    <Col style={{ padding: '8px' }}>
      <Card
        hoverable
        tabList={[
          { tab: 'Overview', key: 'overview' },
          { tab: 'Portfolio', key: 'portfolio' },
          { tab: 'Transactions', key: 'transactions' },
          { tab: 'Details', key: 'details' }
        ]}
        activeTabKey={tab}
        onTabChange={(key) => {
          if (key !== 'details') {
            setTab(key);
          } else {
            history.push('/users/' + user.id);
          }
        }}
      >
        <Card.Meta
          avatar={<Avatar icon="user" />}
          title={<Link to={'/users/' + user.id}>{user.username}</Link>}
        />
        <br />
        {tabs[tab]}
      </Card>
    </Col>
  );
};

export const UserOverview = withRouter(BaseUserOverview);

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
  const [tab, setTab] = useState('0');
  const [option, setOption] = useState('value');

  useEffect(() => {
    addSubscribed(id);

    return () => {
      removeSubscribed(id);
    };
  }, []);

  const user = subscribed.find((u) => u.id === id);
  if (!user) return <p>loading...</p>;

  // const stocks = user.portfolio.map((s) => {
  //   console.log(s);
  //   const change = s.shares * (s.current_price - s.init_price);
  //   const percentChange = change / (s.shares * s.init_price);

  //   return (
  //     <p key={s.id}>
  //       {s.shares}{' '}
  //       <Link to={'/stocks/' + s.symbol}>{s.symbol.toUpperCase()}</Link>{' '}
  //       {s.short ? 'short' : 'stock'} bought for ${s.init_price}, now $
  //       {s.current_price} at {s.timestamp} Change: ${change.toFixed(2)}{' '}
  //       {percentChange.toFixed(4)}%
  //     </p>
  //   );
  // });

  const mapTimestamp = (record) => ({
    ...record,
    time: new Date(
      record.timestamp.split(' ')[0] + 'T' + record.timestamp.split(' ')[1]
    ).getTime()
  });

  const records = [
    user.records.latest_records.map(mapTimestamp),
    user.records.hourly_records.map(mapTimestamp),
    user.records.daily_records.map(mapTimestamp),
    user.records.weekly_records.map(mapTimestamp),
    user.records.monthly_records.map(mapTimestamp)
  ];

  const tabList = [
    {
      key: '0',
      tab: 'Latest'
    },
    {
      key: '1',
      tab: 'Hourly'
    },
    {
      key: '2',
      tab: 'Daily'
    },
    {
      key: '3',
      tab: 'Weekly'
    },
    {
      key: '4',
      tab: 'Monthly'
    }
  ];

  return (
    <div>
      <UserOverview user={user} />
      <Col span={24} style={{ padding: '8px' }}>
        <Card
          title="HISTORY"
          tabList={tabList}
          activeTabKey={tab}
          onTabChange={(key) => setTab(key)}
          extra={
            <Select
              defaultValue={option}
              onChange={(val) => setOption(val)}
              style={{ width: '120px' }}
            >
              <Select.Option value="value">User Value</Select.Option>
              <Select.Option value="balance">User Balance</Select.Option>
            </Select>
          }
        >
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={records[Number(tab)]}>
              <CartesianGrid strokeDasharray="5 5" vertical={false} />
              <XAxis
                type="number"
                padding={{ right: 15 }}
                name="Time"
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickCount={10}
                interval={0}
                domain={['dataMin', 'dataMax']}
                tickFormatter={(time) =>
                  Number(tab) <= 1
                    ? moment(time).format('HH:mm')
                    : moment(time)
                        .format('ddd HH:mm')
                        .toUpperCase()
                }
              />
              <YAxis
                width={80}
                type="number"
                tickLine={false}
                interval={0}
                domain={[
                  (dataMin) => dataMin * 0.96,
                  (dataMax) => dataMax * 1.02
                ]}
                tickFormatter={(val) => '$' + val.toFixed(0)}
              />
              <ChartTooltip
                separator=" "
                formatter={(val, name) => ['$' + val, name.toUpperCase()]}
                labelFormatter={(val) =>
                  moment(val)
                    .format('ddd HH:mm')
                    .toUpperCase()
                }
              />
              <Area
                type="monotone"
                dataKey={option}
                fill="#ccc"
                dot={false}
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

export const UserView = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseUserView);

const BaseLeaderboard = (props) => {
  // useEffect(() => {
  //   props.initLeaderboard();
  // }, []);
  const [option, setOption] = useState(['value', 'decreasing']);

  if (!props.subscribed.length) return <Skeleton active />;

  const options = [
    {
      value: 'value',
      label: 'User Value',
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
      value: 'balance',
      label: 'User Balance',
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
      label: 'Value Change',
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
    value: {
      decreasing: (a, b) => b.value - a.value,
      increasing: (a, b) => a.value - b.value
    },
    balance: {
      decreasing: (a, b) => b.balance - a.balance,
      increasing: (a, b) => a.balance - b.balance
    },
    change: {
      decreasing: (a, b) => {
        const bRecords = b.records.daily_records;
        const aRecords = a.records.daily_records;
        const bChange = b.value - bRecords[bRecords.length - 1].value;
        const aChange = a.value - aRecords[aRecords.length - 1].value;
        return bChange - aChange;
      },
      increasing: (a, b) => {
        const bRecords = b.records.daily_records;
        const aRecords = a.records.daily_records;
        const bChange = b.value - bRecords[bRecords.length - 1].value;
        const aChange = a.value - aRecords[aRecords.length - 1].value;
        return aChange - bChange;
      }
    }
  };

  const sorted = props.subscribed;
  sorted.sort(compare[option[0]][option[1]]);

  return (
    <div>
      <Row type="flex" align="middle">
        <Col span={20}>
          <Breadcrumb style={{ margin: '16px' }}>
            <Breadcrumb.Item>
              <Link to="/users">Users</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Leaderboard</Breadcrumb.Item>
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
      {sorted.map((u) => (
        <UserOverview key={u.id} user={u} />
      ))}
    </div>
  );
};

export const Leaderboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseLeaderboard);
