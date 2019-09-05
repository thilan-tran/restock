import React from 'react';
import { Link } from 'react-router-dom';
import { Statistic, Icon, Tag, Tooltip } from 'antd';

export const portfolioColumns = [
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
