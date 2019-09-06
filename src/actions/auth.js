import axios from 'axios';

import { message } from 'antd';

const userUrl = '/api/users/';

export const checkCachedUser = () => {
  return async (dispatch, getState, socket) => {
    const userData = window.localStorage.getItem('loggedUser');
    if (userData) {
      const userJson = JSON.parse(userData);
      socket.emit('subscribe', userJson.userId);
      const res = await axios.get(userUrl + userJson.userId);
      res.data.tracking.forEach((stock) =>
        dispatch({ type: 'ADD_USER_TRACKING', symbol: stock.symbol })
      );
      dispatch({
        type: 'ADD_SUBSCRIBED',
        user: res.data
      });
      dispatch({
        type: 'LOGIN',
        auth: userJson
      });
    }
  };
};

export const login = (creds, cache = true) => {
  return async (dispatch, getState, socket) => {
    try {
      let res = await axios.post(userUrl + 'login', creds);

      const userData = { token: res.data.auth_token, userId: res.data.id };

      dispatch({
        type: 'LOGIN',
        auth: userData
      });

      if (cache) {
        window.localStorage.setItem('loggedUser', JSON.stringify(userData));
      }

      socket.emit('subscribe', res.data.id);
      res = await axios.get(userUrl + res.data.id);
      dispatch({
        type: 'ADD_SUBSCRIBED',
        user: res.data
      });

      res.data.tracking.forEach((stock) =>
        dispatch({ type: 'ADD_USER_TRACKING', symbol: stock.symbol })
      );

      message.success('Login succesful.');
    } catch (err) {
      console.error(err.response);
      message.error('Invalid username or password.');
    }
  };
};

export const logout = () => {
  return (dispatch, getState, socket) => {
    socket.emit('unsubscribe', getState().auth.userId);
    window.localStorage.removeItem('loggedUser');
    dispatch({ type: 'LOGOUT' });
    message.success('Logout succesful.');
  };
};

export const register = (creds) => {
  return async (dispatch) => {
    try {
      const res = await axios.post(userUrl + 'register', creds);
      message.success(`Registration of user ${res.username} successful.`);
    } catch (err) {
      console.error(err.response.data);
      message.error(err.response.data.error.message);
    }
  };
};
