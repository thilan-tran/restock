import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  Cascader,
  Avatar,
  Card,
  Row,
  Col,
  List,
  Statistic,
  Input,
  Icon,
  Table,
  Tag,
  Tooltip,
  Empty,
  Skeleton,
  Select
} from 'antd';

import { baseMenu } from './Routes';
import { TimeAreaChart } from './Recharts';
import { transactionColumns, portfolioColumns, trackingColumns } from './Table';
import {
  initLeaderboard,
  addSubscribed,
  removeSubscribed
} from '../actions/users';
import StockService from '../services/StockService';

const getColor = (change) =>
  change > 0 ? '#3f8600' : change === 0 ? '#595959' : '#cf1322';

const getType = (change) =>
  change > 0 ? 'arrow-up' : change === 0 ? 'line' : 'arrow-down';

const BaseUserOverview = ({ user, history, expanded }) => {
  const [tab, setTab] = useState('overview');

  const dailyRecords = user.records.daily_records;
  const lastValue =
    dailyRecords.length > 1
      ? dailyRecords[dailyRecords.length - 2].value
      : dailyRecords[0].value;

  const change = user.value - lastValue;
  const percentChange = (change / lastValue) * 100;

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
            value={change.toFixed(2)}
            precision={2}
            valueStyle={{
              color: getColor(change)
            }}
            prefix={<Icon type={getType(change)} />}
          />
          <Statistic
            value={percentChange.toFixed(2)}
            precision={4}
            valueStyle={{
              color: getColor(percentChange)
            }}
            prefix={<Icon type={getType(percentChange)} />}
            suffix="%"
          />
        </span>
      </Col>
      <Col span={6}>
        <span>
          <Statistic
            title="Overall Change"
            value={overallChange.toFixed(2)}
            precision={2}
            valueStyle={{
              color: getColor(overallChange)
            }}
            prefix={<Icon type={getType(overallChange)} />}
          />
          <Statistic
            value={overallPercentChange.toFixed(2)}
            precision={4}
            valueStyle={{
              color: getColor(overallPercentChange)
            }}
            prefix={<Icon type={getType(overallPercentChange)} />}
            suffix="%"
          />
        </span>
      </Col>
    </Row>
  );

  const transactColumns = transactionColumns(false);
  transactColumns[0].filters = [
    ...new Set(user.transactions.map((stock) => stock.symbol))
  ].map((elem) => ({ text: elem.toUpperCase(), value: elem }));

  const transactions = user.transactions.length ? (
    <Table
      pagination={{ pageSize: 10, size: 'small' }}
      columns={transactColumns}
      dataSource={user.transactions}
      rowKey={(record) => record.id}
      scroll={{ y: 300 }}
    />
  ) : (
    <Empty description="No stock transaction history." />
  );

  const portColumns = portfolioColumns(false);
  portColumns[0].filters = [
    ...new Set(user.portfolio.map((stock) => stock.symbol))
  ].map((elem) => ({ text: elem.toUpperCase(), value: elem }));

  const portfolio = user.portfolio.length ? (
    <Table
      pagination={{ pageSize: 10, size: 'small' }}
      columns={portColumns}
      dataSource={user.portfolio}
      rowKey={(record) => record.id}
      scroll={{ y: 300 }}
    />
  ) : (
    <Empty description="No purchased stocks." />
  );

  const trackColumns = trackingColumns();

  const tracking = user.tracking.length ? (
    <Table
      pagination={{ pageSize: 10, size: 'small' }}
      columns={trackColumns}
      dataSource={user.tracking}
      rowKey={(record) => record.symbol}
      scroll={{ y: 300 }}
    />
  ) : (
    <Empty description="Track stocks for real-time notifications." />
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
        tabList={
          expanded
            ? [
                { tab: 'Overview', key: 'overview' },
                { tab: 'Portfolio', key: 'portfolio' },
                { tab: 'Transactions', key: 'transactions' },
                { tab: 'Tracking', key: 'tracking' }
              ]
            : [
                { tab: 'Overview', key: 'overview' },
                { tab: 'Portfolio', key: 'portfolio' },
                { tab: 'Transactions', key: 'transactions' },
                { tab: 'Tracking', key: 'tracking' },
                { tab: 'Details', key: 'details' }
              ]
        }
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

const BaseUserView = ({ id, addSubscribed, removeSubscribed, subscribed }) => {
  const [tab, setTab] = useState('0');
  const [option, setOption] = useState('value');

  useEffect(() => {
    addSubscribed(id);

    return () => {
      removeSubscribed(id);
    };
  }, []);

  const user = subscribed.find((u) => u.id === id);
  if (!user) return <Skeleton active />;

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
      <UserOverview user={user} expanded />

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
          <TimeAreaChart
            type={Number(tab)}
            data={records[Number(tab)]}
            dataKey={option}
          />
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
  useEffect(() => {
    // props.initLeaderboard();
  }, []);

  const [option, setOption] = useState(['value', 'decreasing']);

  if (!props.subscribed.length)
    return (
      <div>
        <Row type="flex" align="middle">
          <Col span={20}>
            <Breadcrumb style={{ margin: '16px' }}>
              <Breadcrumb.Item overlay={baseMenu}>Users</Breadcrumb.Item>
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
      </div>
    );

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
            <Breadcrumb.Item overlay={baseMenu}>Users</Breadcrumb.Item>
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
      <List
        itemLayout="vertical"
        size="large"
        pagination={{ pageSize: 10 }}
        dataSource={sorted}
        renderItem={(user) => <UserOverview key={user.id} user={user} />}
      />
    </div>
  );
};

export const Leaderboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseLeaderboard);

export const UserSearch = () => {
  const [searchData, setData] = useState([]);

  const handleSearch = (search) => {
    StockService.getUserSearch(search).then((data) => setData(data));
  };

  return (
    <div>
      <Row type="flex" justify="center">
        <Col span={16} style={{ margin: '25px' }}>
          <Input.Search
            placeholder="Search Usernames"
            size="large"
            onSearch={handleSearch}
          />
        </Col>
      </Row>
      {searchData.length ? (
        searchData.map((result) => (
          <Col
            key={result.id}
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={8}
            style={{ padding: '8px' }}
          >
            <Link to={'/users/' + result.id}>
              <Card title={result.username} hoverable>
                <Col span={12}>
                  <Statistic
                    title="Balance"
                    value={result.balance}
                    precision={2}
                    prefix={<Icon type="dollar" />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Value"
                    value={result.value}
                    precision={2}
                    prefix={<Icon type="dollar" />}
                  />
                </Col>
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
