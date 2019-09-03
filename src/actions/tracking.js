import axios from 'axios';
import React from 'react';
import { notification, Icon } from 'antd';

const trackingUrl = '/api/tracking/';
const overviewUrl = '/api/stocks/overview';

export const initOverview = () => {
  return async (dispatch, getState, socket) => {
    const state = getState();

    if (!state.overviewInitialized) {
      const res = await axios.get(overviewUrl);
      res.data.forEach(async (stock) => {
        const stockRes = await axios.post(trackingUrl, {
          symbol: stock.ticker.toLowerCase(),
          prev_price: stock.price - stock.changes
        });
        socket.emit('track', stock.ticker.toLowerCase());
        dispatch({
          type: 'ADD_TRACKING',
          tracking: stockRes.data
        });
      });
      dispatch({ type: 'OVERVIEW_INIT' });
    } else {
      console.log('already initialized');
    }
  };
};

export const initTracking = (data) => {
  return (dispatch) => {
    dispatch({
      type: 'FORCE_ADD_TRACKING',
      tracking: data
    });
  };
};

export const addTracking = (symbol, token = null) => {
  const config = {
    headers: { Authorization: token ? `bearer ${token}` : '' }
  };

  return async (dispatch, getState, socket) => {
    const res = await axios.post(trackingUrl, { symbol }, config);
    socket.emit('track', symbol);
    dispatch({
      type: 'ADD_TRACKING',
      tracking: res.data
    });
  };
};

export const updateTracking = (symbol, price) => {
  notification.open({
    message: 'Stock Update',
    description: `${symbol.toUpperCase()} updated to $${price}`,
    icon: <Icon type="stock" style={{ color: '#108ee9' }} />,
    duration: 6
  });
  return (dispatch) => {
    dispatch({
      type: 'UPDATE_TRACKING',
      symbol,
      price
    });
  };
};

export const removeTracking = (symbol, token = null) => {
  const config = {
    headers: { Authorization: token ? `bearer ${token}` : '' }
  };

  return async (dispatch, getState, socket) => {
    const res = await axios.delete(trackingUrl, { symbol }, config);
    socket.emit('untrack', symbol);
    dispatch({
      type: 'REMOVE_TRACKING',
      symbol
    });
  };
};
