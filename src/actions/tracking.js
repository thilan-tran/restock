import axios from 'axios';
import React from 'react';
import { message, notification, Icon } from 'antd';

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
      console.log('already initialized overview');
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

export const addTracking = (symbol, prevPrice, token = null) => {
  const config = {
    headers: { Authorization: token ? `bearer ${token}` : '' }
  };

  return async (dispatch, getState, socket) => {
    try {
      const res = await axios.post(
        trackingUrl,
        { symbol, prev_price: prevPrice },
        config
      );
      console.log(res);
      socket.emit('track', symbol);
      dispatch({
        type: 'ADD_TRACKING',
        tracking: res.data
      });
      if (token) {
        dispatch({
          type: 'ADD_USER_TRACKING',
          symbol
        });
      }
    } catch (err) {
      console.error(err.response.data);
      message.error(err.response.data.error.message);
    }
  };
};

// export const addTempTracking = (symbol) => {
//   return async (dispatch, getState, socket) => {
//     try {
//       const res = await axios.post(trackingUrl, { symbol });
//       console.log(res);
//       socket.emit('track', symbol);
//       dispatch({
//         type: 'ADD_TRACKING',
//         tracking: res.data
//       });
//     } catch (err) {
//       console.error(err.response.data);
//       message.error(err.response.data.error.message);
//     }
//   };
// };

export const updateTracking = (symbol, price) => {
  const message = `${symbol.toUpperCase()} updated to $${price}`;
  // notification.open({
  //   message: 'Stock Update',
  //   description: `${symbol.toUpperCase()} updated to $${price}`,
  //   icon: <Icon type="stock" style={{ color: '#108ee9' }} />,
  //   duration: 6
  // });
  return (dispatch) => {
    dispatch({
      type: 'UPDATE_TRACKING',
      symbol,
      price
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      notifiation: {
        type: 'stock',
        message,
        time: new Date()
      }
    });
  };
};

export const removeTracking = (symbol, token = null) => {
  return async (dispatch, getState, socket) => {
    const state = getState();
    try {
      const res = await axios.delete(trackingUrl, {
        headers: { Authorization: token ? `bearer ${token}` : '' },
        data: { symbol }
      });
      if (!token) {
        socket.emit('untrack', symbol);
        dispatch({
          type: 'REMOVE_TRACKING',
          symbol
        });
      } else {
        dispatch({ type: 'REMOVE_USER_TRACKING', symbol });
      }
    } catch (err) {
      console.error(err.response.data);
      message.error(err.response.data.error.message);
    }
  };
};
