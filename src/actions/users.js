import axios from 'axios';

const userUrl = '/api/users/';
const transactUrl = '/api/transactions/';
const trackingUrl = '/api/tracking/';

export const initLeaderboard = () => {
  return async (dispatch) => {
    const res = await axios.get(userUrl + 'leaderboard');
    console.log(res.data);
    dispatch({
      type: 'SET_LEADERBOARD',
      users: res.data
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
  return async (dispatch) => {
    const res = await axios.get(userUrl + id);
    console.log(res.data);
    dispatch({
      type: 'ADD_SUBSCRIBED',
      user: res.data
    });
  };
};

export const updateSubscribed = (user) => {
  return (dispatch) => {
    dispatch({
      type: 'UPDATE_SUBSCRIBED',
      user
    });
  };
};

export const removeSubscribed = (id) => {
  return (dispatch) => {
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
    console.log(res.data);
    dispatch({
      type: 'NEW_TRANSACTION',
      transaction: res.data
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
      type: 'DELETE_TRANSACTION',
      id,
      user
    });
  };
};

export const initAll = () => {
  return async (dispatch) => {
    const res = await axios.get(userUrl);
    console.log(res.data);
    dispatch({
      type: 'INIT_USERS',
      initState: res.data
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

export const updateTransaction = (symbol, newPrice, id) => {
  return (dispatch) => {
    dispatch({
      type: 'UPDATE_TRANSACTION',
      data: {
        symbol,
        newPrice,
        id
      }
    });
  };
};

export const addTracking = async (symbol, token) => {
  const config = {
    headers: { Authorization: `bearer ${token}` }
  };
  const res = await axios.post(trackingUrl, { symbol }, config);
  console.log(res.data);
};

export const removeTracking = async (symbol, token) => {
  const config = {
    headers: { Authorization: `bearer ${token}` }
  };
  await axios.delete(trackingUrl, { symbol }, config);
};
