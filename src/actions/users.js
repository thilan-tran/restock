import axios from 'axios';
import React from 'react';
import { message, notification, Icon } from 'antd';

const userUrl = '/api/users/';
const transactUrl = '/api/transactions/';

export const initLeaderboard = () => {
  return async (dispatch, getState, socket) => {
    const state = getState();
    if (!state.leaderboardInitialized) {
      const res = await axios.get(userUrl + 'leaderboard');

      res.data.forEach((user) => {
        socket.emit('subscribe', user.id);
        dispatch({
          type: 'ADD_SUBSCRIBED',
          user: user
        });
      });
      dispatch({
        type: 'SET_LEADERBOARD',
        users: res.data.map((elem) => elem.id)
      });

      dispatch({ type: 'LEADERBOARD_INIT' });
      console.log('initialized leaderboard');
    } else {
      console.log('already initialized leaderboard');
    }
  };
};

export const setLeaderboard = (users) => {
  return (dispatch, getState, socket) => {
    const state = getState();

    const newUsers = users.filter((id) => !state.leaderboard.includes(id));
    console.log(newUsers);
    newUsers.forEach(async (id) => {
      socket.emit('subscribe', id);
      const res = await axios.get(userUrl + id);
      dispatch({
        type: 'ADD_SUBSCRIBED',
        user: res.data
      });
    });

    dispatch({
      type: 'SET_LEADERBOARD',
      users
    });
  };
};

export const addSubscribed = (id) => {
  return async (dispatch, getState, socket) => {
    socket.emit('subscribe', id);
    const res = await axios.get(userUrl + id);
    dispatch({
      type: 'ADD_SUBSCRIBED',
      user: res.data
    });
  };
};

export const updateSubscribed = (data) => {
  // notification.open({
  //   message: 'User',
  //   description: `${user.username} value updated to $${user.value}`,
  //   icon: <Icon type="user" style={{ color: '#108ee9' }} />,
  //   duration: 6
  // });

  const { type, update, user } = data;
  let msg = '';
  if (type === 'transaction') {
    msg = `${update.user} ${update.purchase ? 'purchased' : 'sold'} ${
      update.shares
    } ${
      update.short ? 'short' : 'long'
    } shares of ${update.symbol.toUpperCase()}.`;
  }
  // else if (type === 'tracking') {
  //   message = `${update.user} started tracking ${update.symbol}.`;
  // } else if (type === 'untracking') {
  //   message = `${update.user} stopped tracking ${update.symbol}.`;
  // }

  return (dispatch, getState) => {
    dispatch({
      type: 'UPDATE_SUBSCRIBED',
      user
    });
    if (msg) {
      console.log(msg);
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          type: 'user',
          message: msg,
          update,
          time: new Date()
        }
      });

      const state = getState();
      dispatch({ type: 'ACTIVATE_MESSAGE' });
      if (!state.activeMessage && update.user !== state.auth.username) {
        message.info('New notifications for users.', 8, () =>
          dispatch({ type: 'DEACTIVATE_MESSAGE' })
        );
      }
    }
  };
};

export const removeSubscribed = (id) => {
  return (dispatch, getState, socket) => {
    const state = getState();
    const onLeaderboard = state.leaderboard.includes(id);
    if (!onLeaderboard && id != state.auth.userId) {
      socket.emit('unsubscribe', id);
      dispatch({
        type: 'REMOVE_SUBSCRIBED',
        id
      });
    }
  };
};

export const createTransaction = (transaction, token) => {
  const config = {
    headers: { Authorization: `bearer ${token}` }
  };
  return async (dispatch) => {
    try {
      const res = await axios.post(transactUrl, transaction, config);
    } catch (err) {
      console.error(err.response.data);
      message.error(err.response.data.error.message);
    }
    dispatch({
      type: 'OTHER'
      // type: 'NEW_TRANSACTION',
      // transaction: res.data
    });
    message.success('Transaction succesful.');
  };
};

export const removeTransaction = (transaction, token) => {
  return async (dispatch) => {
    try {
      const res = await axios.delete(transactUrl, {
        headers: { Authorization: `bearer ${token}` },
        data: transaction
      });
    } catch (err) {
      console.error(err.response.data);
      message.error(err.response.data.error.message);
    }
    dispatch({
      type: 'OTHER'
      // type: 'DELETE_TRANSACTION',
      // id,
      // user
    });
    message.success('Transaction succesful.');
  };
};

export const updateAll = (newState) => {
  return async (dispatch) => {
    dispatch({
      type: 'UPDATE_ALL_USERS',
      newState
    });
  };
};
