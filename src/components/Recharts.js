import React from 'react';
import moment from 'moment';
import {
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

const dayFormatter = (time) => {
  const hourMin = Number(time.substr(4, 2) + time.substr(7, 2));
  if (hourMin === 945) {
    return time.split(' ')[0].toUpperCase();
  }
  return '';
};

const monthFormatter = (time) => {
  const dayOfMonth = Number(time.split(' ')[1]);
  const weekday = time.split(' ')[2];
  if (dayOfMonth <= 7 && weekday === 'MON') {
    return time.split(' ')[0].toUpperCase();
  }
  return '';
};

export const ValueAreaChart = ({ type, data }) => (
  <ResponsiveContainer width="100%" height={500}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="5 5" vertical={false} />
      <XAxis
        dataKey="time"
        axisLine={false}
        tickLine={false}
        interval={0}
        tickFormatter={type === 'days' ? dayFormatter : monthFormatter}
      />

      <YAxis
        type="number"
        tickLine={false}
        interval={0}
        domain={[(dataMin) => dataMin * 0.98, (dataMax) => dataMax * 1.02]}
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
);

export const TimeAreaChart = ({ type, data, dataKey }) => (
  <ResponsiveContainer width="100%" height={400}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="5 5" vertical={false} />
      <XAxis
        type="number"
        padding={{ right: 20 }}
        name="Time"
        dataKey="time"
        axisLine={false}
        tickLine={false}
        tickCount={10}
        interval={0}
        domain={['dataMin', 'dataMax']}
        tickFormatter={(time) =>
          type <= 1
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
        domain={[(dataMin) => dataMin * 0.96, (dataMax) => dataMax * 1.02]}
        tickFormatter={(val) => '$' + val.toFixed(0)}
      />
      <Tooltip
        separator=" "
        formatter={(val, name) => ['$' + val.toFixed(2), name.toUpperCase()]}
        labelFormatter={(val) =>
          moment(val)
            .format('ddd HH:mm')
            .toUpperCase()
        }
      />
      <Area
        type="monotone"
        dataKey={dataKey}
        fill="#ccc"
        dot={false}
        activeDot={{ r: 8, strokeWidth: 2 }}
        strokeWidth={4}
      />
    </AreaChart>
  </ResponsiveContainer>
);
