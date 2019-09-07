import React, { useState } from 'react';
import { connect } from 'react-redux';

import { Row, Col, Table, Empty, Card, Select } from 'antd';

import { simpleColumns, transactionColumns } from './Table';

const BaseStockNotifications = (props) => {
  const [option, setOption] = useState('tracking');

  const stockNotifications = props.notifications.filter(
    (notif) => notif.type === 'stock'
  );

  const trackedNotifications = props.notifications.filter(
    (notif) =>
      notif.type === 'stock' && props.userTracking.includes(notif.symbol)
  );

  const filtered =
    option === 'tracking' ? trackedNotifications : stockNotifications;

  const simpColumns = simpleColumns();
  simpColumns[0].filters = [
    ...new Set(filtered.map((stock) => stock.symbol))
  ].map((elem) => ({ text: elem.toUpperCase(), value: elem }));

  const tracking = stockNotifications.length ? (
    <Table
      pagination={{ pageSize: 20, size: 'small' }}
      columns={simpColumns}
      dataSource={filtered}
      rowKey={(record) => record.timestamp + record.message}
      scroll={{ y: 550 }}
    />
  ) : (
    <Empty
      description="No recent stock updates."
      style={{ marginTop: '150px' }}
    />
  );

  return (
    <Card
      title="STOCKS"
      style={{ height: '700px', padding: '8px' }}
      extra={
        <Select
          defaultValue={option}
          onChange={(val) => setOption(val)}
          style={{ width: '160px' }}
        >
          <Select.Option value="tracking">Tracked Updates</Select.Option>
          <Select.Option value="all">All Updates</Select.Option>
        </Select>
      }
    >
      {tracking}
    </Card>
  );
};

const mapStateToProps = (state) => ({
  notifications: state.notifications,
  userTracking: state.userTracking
});

export const StockNotifications = connect(mapStateToProps)(
  BaseStockNotifications
);

const BaseUserNotifications = (props) => {
  const userNotifications = props.notifications
    .filter((notif) => notif.type === 'user')
    .map((elem) => elem.update);

  const transactColumns = transactionColumns(true);
  transactColumns[1].filters = [
    ...new Set(userNotifications.map((transact) => transact.symbol))
  ].map((elem) => ({ text: elem.toUpperCase(), value: elem }));
  transactColumns[0].filters = [
    ...new Set(
      userNotifications.map(
        (transact) => transact.user + ' ' + transact.user_id
      )
    )
  ].map((elem) => ({ text: elem.split(' ')[0], value: elem.split(' ')[1] }));

  const transactions = userNotifications.length ? (
    <Table
      pagination={{ pageSize: 20, size: 'small' }}
      columns={transactColumns}
      dataSource={userNotifications}
      rowKey={(record) => record.id}
      scroll={{ y: 550 }}
    />
  ) : (
    <Empty
      description="No recent transactions from users."
      style={{ marginTop: '150px' }}
    />
  );

  return (
    <Card title="USERS" style={{ minHeight: '700px', padding: '8px' }}>
      {transactions}
    </Card>
  );
};

export const UserNotifications = connect(mapStateToProps)(
  BaseUserNotifications
);
