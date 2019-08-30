import axios from 'axios';
import React from 'react';
import { notification, Icon } from 'antd';

const userUrl = '/api/users/';
const transactUrl = '/api/transactions/';

export const initLeaderboard = () => {
  return async (dispatch, getState, socket) => {
    const res = await axios.get(userUrl + 'leaderboard');
    res.data.forEach((user) => {
      socket.emit('subscribe', user.id);
      dispatch({
        type: 'FORCE_ADD_SUBSCRIBED',
        user: user
      });
    });
    dispatch({
      type: 'SET_LEADERBOARD',
      users: res.data.map((elem) => elem.id)
    });
  };
};

export const setLeaderboard = (users) => {
  return (dispatch) => {
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

export const updateSubscribed = (user) => {
  notification.open({
    message: 'User',
    description: `${user.username} worth updated to $${user.worth}`,
    icon: <Icon type="user" style={{ color: '#108ee9' }} />,
    duration: 6
  });
  return (dispatch) => {
    dispatch({
      type: 'UPDATE_SUBSCRIBED',
      user
    });
  };
};

export const removeSubscribed = (id) => {
  return (dispatch, getState, socket) => {
    socket.emit('unsubscribe', id);
    dispatch({
      type: 'REMOVE_SUBSCRIBED',
      id
    });
  };
};

export const createTransaction = (transaction, token) => {
  const config = {
    headers: { Authorization: `bearer ${token}` }
  };
  return async (dispatch) => {
    const res = await axios.post(transactUrl, transaction, config);
    dispatch({
      type: 'OTHER'
      // type: 'NEW_TRANSACTION',
      // transaction: res.data
    });
  };
};

export const removeTransaction = (id, user, token) => {
  const config = {
    headers: { Authorization: `bearer ${token}` }
  };
  return async (dispatch) => {
    const res = await axios.delete(transactUrl + id, config);
    console.log(res.data);
    dispatch({
      type: 'OTHER'
      // type: 'DELETE_TRANSACTION',
      // id,
      // user
    });
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
