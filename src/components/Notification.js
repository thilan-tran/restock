import React from 'react';
import { connect } from 'react-redux';

import { Col, Table, Empty, Card } from 'antd';

import { transactionColumns } from './Table';

const BaseNotificationView = (props) => {
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
      scroll={{ y: 300 }}
    />
  ) : (
    <Empty />
  );

  return (
    <div>
      <Col span={12} style={{ padding: '8px' }}>
        <Card title="USERS" style={{ height: '100%' }}>
          {transactions}
        </Card>
      </Col>
      <Col span={12} style={{ padding: '8px' }}>
        <Card title="STOCKS" style={{ height: '100%' }}>
          {props.notifications
            .filter((notif) => notif.type === 'stock')
            .map((notif) => (
              <p key={notif.time}>{notif.message}</p>
            ))}
        </Card>
      </Col>
    </div>
  );
};

const mapStateToProps = (state) => ({ notifications: state.notifications });

export const NotificationView = connect(mapStateToProps)(BaseNotificationView);
