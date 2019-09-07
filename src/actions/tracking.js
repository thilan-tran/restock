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

      // res.data.forEach(async (stock) => {
      //   const stockRes = await axios.post(trackingUrl, {
      //     symbol: stock.ticker.toLowerCase(),
      //     prev_price: stock.price - stock.changes
      //   });
      //   socket.emit('track', stock.ticker.toLowerCase());
      //   dispatch({
      //     type: 'ADD_TRACKING',
      //     tracking: stockRes.data
      //   });
      // });

      const promises = res.data.map(async (stock) => {
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

      await Promise.all(promises);
      dispatch({ type: 'OVERVIEW_INIT' });
      console.log('initialized overview');
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

export const addTracking = (symbol, prevPrice = null, saveUser = false) => {
  return async (dispatch, getState, socket) => {
    const state = getState();
    const token = state.auth.token;

    const config = {
      headers: { Authorization: saveUser && token ? `bearer ${token}` : '' }
    };

    try {
      const res = await axios.post(
        trackingUrl,
        prevPrice ? { symbol, prev_price: prevPrice } : { symbol },
        config
      );
      socket.emit('track', symbol);
      dispatch({
        type: 'ADD_TRACKING',
        tracking: res.data
      });
      if (saveUser) {
        dispatch({
          type: 'ADD_USER_TRACKING',
          symbol
        });
      }
    } catch (err) {
      console.error(err.response.data);
      // message.error(err.response.data.error.message);
    }
  };
};

export const updateTracking = (symbol, price, prevPrice) => {
  const message = `${symbol.toUpperCase()} updated to $${price}`;
  return (dispatch, getState) => {
    dispatch({
      type: 'UPDATE_TRACKING',
      symbol,
      price
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        type: 'stock',
        message,
        symbol,
        price,
        prevPrice,
        timestamp: new Date()
      }
    });

    const state = getState();
    dispatch({ type: 'ACTIVATE_MESSAGE' });
    if (!state.activeMessage) {
      message.info('New notifiations for stocks.', 10, () =>
        dispatch({ type: 'DEACTIVATE_MESSAGE' })
      );
    }
  };
};

export const removeTracking = (symbol, clearUser = false) => {
  return async (dispatch, getState, socket) => {
    const state = getState();
    const token = state.auth.token;

    try {
      const res = await axios.delete(trackingUrl, {
        headers: {
          Authorization: clearUser && token ? `bearer ${token}` : ''
        },
        data: { symbol }
      });

      if (!clearUser) {
        if (!state.userTracking.includes(symbol)) {
          socket.emit('untrack', symbol);
          dispatch({
            type: 'REMOVE_TRACKING',
            symbol
          });
        }
      } else {
        dispatch({ type: 'REMOVE_USER_TRACKING', symbol });
      }
    } catch (err) {
      console.error(err.response.data);
      // message.error(err.response.data.error.message);
    }
  };
};
