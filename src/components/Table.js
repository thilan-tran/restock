import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import { Statistic, Icon, Tag, Tooltip } from 'antd';

const getColor = (change) => {
  const trim = Number(change.toString().toFixed(2));
  return trim > 0 ? '#3f8600' : trim === 0 ? '#595959' : '#cf1322';
};

const getType = (change) => {
  const trim = Number(change.toString().toFixed(2));
  return trim > 0 ? 'arrow-up' : trim === 0 ? 'line' : 'arrow-down';
};

export const simpleColumns = () => {
  const symbol = {
    title: 'Symbol',
    dataIndex: 'symbol',
    key: 'symbol',
    width: '25%',
    onFilter: (value, record) => record.symbol === value,
    render: (text) => <Link to={'/stocks/' + text}>{text.toUpperCase()}</Link>
  };

  const price = {
    title: 'Price',
    dataIndex: 'price',
    sorter: (a, b) => a.price - b.price,
    sortDirections: ['descend', 'ascend'],
    width: '25%',
    render: (text) => (
      <Statistic value={text} precision={2} prefix={<Icon type="dollar" />} />
    )
  };

  const priceChange = {
    title: 'Change',
    key: 'priceChange',
    sorter: (a, b) => a.price - a.prevPrice - (b.price - b.prevPrice),
    sortDirections: ['descend', 'ascend'],
    width: '25%',
    render: (text, record) => {
      const priceChange = record.price - record.prevPrice;

      return (
        <Statistic
          value={priceChange}
          precision={2}
          valueStyle={{
            color: getColor(priceChange)
          }}
          prefix={<Icon type={getType(priceChange)} />}
        />
      );
    }
  };

  const time = {
    title: 'Time',
    dataIndex: 'timestamp',
    key: 'timestamp',
    sorter: (a, b) => a.timestamp - b.timestamp,
    sortDirections: ['descend', 'ascend'],
    defaultSortOrder: 'descend',
    render: (time) => <p>{moment(time.getTime()).fromNow()}</p>
  };

  return [symbol, price, priceChange, time];
};

export const trackingColumns = () => {
  const symbol = {
    title: 'Symbol',
    dataIndex: 'symbol',
    key: 'symbol',
    width: '30%',
    onFilter: (value, record) => record.symbol === value,
    render: (text) => <Link to={'/stocks/' + text}>{text.toUpperCase()}</Link>
  };

  const price = {
    title: 'Price',
    dataIndex: 'price',
    sorter: (a, b) => a.price - b.price,
    sortDirections: ['descend', 'ascend'],
    width: '30%',
    render: (text) => (
      <Statistic value={text} precision={2} prefix={<Icon type="dollar" />} />
    )
  };

  const priceChange = {
    title: 'Daily Change',
    key: 'priceChange',
    sorter: (a, b) => a.price - a.prev_price - (b.price - b.prev_price),
    sortDirections: ['descend', 'ascend'],
    render: (text, record) => {
      const priceChange = record.price - record.prev_price;

      return (
        <Statistic
          value={priceChange}
          precision={2}
          valueStyle={{
            color: getColor(priceChange)
          }}
          prefix={<Icon type={getType(priceChange)} />}
        />
      );
    }
  };

  return [symbol, price, priceChange];
};

export const portfolioColumns = (compact) => {
  const symbol = {
    title: 'Symbol',
    dataIndex: 'symbol',
    key: 'symbol',
    width: '15%',
    onFilter: (value, record) => record.symbol === value,
    render: (text) => <Link to={'/stocks/' + text}>{text.toUpperCase()}</Link>
  };

  const shares = {
    title: 'Total Shares',
    dataIndex: 'shares',
    key: 'shares',
    width: '25%',
    sorter: (a, b) => a.shares - b.shares,
    sortDirections: ['descend', 'ascend'],
    defaultSortOrder: 'descend',
    render: (text) => (
      <Statistic value={text} prefix={<Icon type="pie-chart" />} />
    )
  };

  const priceChange = {
    title: 'Daily Price Change',
    dataIndex: 'current_price',
    key: 'currentPrice',
    sorter: (a, b) =>
      a.current_price - a.prev_price - (b.current_price - b.prev_price),
    sortDirections: ['descend', 'ascend'],
    width: '25%',
    render: (text, record) => {
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
              color: getColor(priceChange)
            }}
            prefix={<Icon type={getType(priceChange)} />}
          />
        </span>
      );
    }
  };

  const overallChange = {
    title: 'Overall Change',
    key: 'change',
    width: '25%',
    sorter: (a, b) => {
      let aChange = a.current_price * a.shares - a.init_value;
      aChange = a.short ? -1 * aChange : aChange;

      let bChange = b.current_price * b.shares - b.init_value;
      bChange = b.short ? -1 * bChange : bChange;

      return aChange - bChange;
    },
    sortDirections: ['descend', 'ascend'],
    render: (text, record) => {
      let change = record.current_price * record.shares - record.init_value;
      change = record.short ? -1 * change : change;
      const percentChange = (change / record.init_value) * 100;

      return (
        <Tooltip
          title={`${
            record.short ? 'Short' : 'Long'
          } stocks increase in value if their price ${
            record.short ? 'decreases' : 'increases'
          }.`}
        >
          <Statistic
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
        </Tooltip>
      );
    }
  };

  const type = {
    title: 'Type',
    key: 'type',
    filters: [
      {
        text: 'Long',
        value: false
      },
      {
        text: 'Short',
        value: true
      }
    ],
    onFilter: (value, record) => record.short === value,
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
  };

  return compact
    ? [symbol, shares, overallChange, type]
    : [symbol, shares, priceChange, overallChange, type];
};

export const transactionColumns = (showUser) => {
  const user = {
    title: 'User',
    dataIndex: 'user',
    key: 'user',
    width: '15%',
    onFilter: (value, record) => record.user_id === value,
    render: (text, record) => (
      <Link to={'/users/' + record.user_id}>{text}</Link>
    )
  };

  const symbol = {
    title: 'Symbol',
    dataIndex: 'symbol',
    key: 'symbol',
    width: '15%',
    onFilter: (value, record) => record.symbol === value,
    render: (text) => <Link to={'/stocks/' + text}>{text.toUpperCase()}</Link>
  };

  const shares = {
    title: 'Shares',
    dataIndex: 'shares',
    key: 'shares',
    width: '20%',
    sorter: (a, b) => a.shares - b.shares,
    sortDirections: ['descend', 'ascend'],
    render: (text) => (
      <Statistic value={text} prefix={<Icon type="pie-chart" />} />
    )
  };

  const price = {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    width: '20%',
    sorter: (a, b) => a.price - b.price,
    sortDirections: ['descend', 'ascend'],
    render: (text) => (
      <Statistic value={text} precision={2} prefix={<Icon type="dollar" />} />
    )
  };

  const type = {
    title: 'Type',
    key: 'type',
    width: '20%',
    filters: [
      {
        text: 'Long',
        value: ['short', false]
      },
      {
        text: 'Short',
        value: ['short', true]
      },
      {
        text: 'Buy',
        value: ['purchase', true]
      },
      {
        text: 'Sell',
        value: ['purchase', false]
      }
    ],
    onFilter: (value, record) => record[value[0]] === value[1],
    render: (text, record) => (
      <span>
        {record.short ? (
          <Tooltip title="Short stocks increase in value if their price decreases.">
            <Tag color="orange">short</Tag>
          </Tooltip>
        ) : (
          <Tooltip title="Long stocks increase in value if their price increases.">
            <Tag color="purple">long</Tag>
          </Tooltip>
        )}
        {record.purchase ? (
          <Tooltip title="Buying stocks transacts funds from user balance.">
            <Tag color="blue">buy</Tag>
          </Tooltip>
        ) : (
          <Tooltip title="Selling stock returns funds to user balance.">
            <Tag color="red">sell</Tag>
          </Tooltip>
        )}
      </span>
    )
  };

  const time = {
    title: 'Date',
    dataIndex: 'timestamp',
    key: 'timestamp',
    sorter: (a, b) =>
      new Date(a.timestamp.split(' ')[0] + 'T' + a.timestamp.split(' ')[1]) -
      new Date(b.timestamp.split(' ')[0] + 'T' + b.timestamp.split(' ')[1]),
    sortDirections: ['descend', 'ascend'],
    defaultSortOrder: 'descend'
  };

  return showUser
    ? [user, symbol, shares, price, type, time]
    : [symbol, shares, price, type, time];
};
