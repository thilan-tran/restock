import axios from 'axios';

const userUrl = '/api/users/';

export const checkCachedUser = () => {
  return (dispatch) => {
    const userData = window.localStorage.getItem('loggedUser');
    if (userData) {
      dispatch({
        type: 'LOGIN',
        auth: JSON.parse(userData)
      });
    }
  };
};

export const login = (creds, cache = true) => {
  return async (dispatch, getState, socket) => {
    let res = await axios.post(userUrl + 'login', creds);

    console.log(res.data);
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
  };
};

export const logout = () => {
  return (dispatch, getState, socket) => {
    socket.emit('unsubscribe', getState().auth.userId);
    window.localStorage.removeItem('loggedUser');
    dispatch({ type: 'LOGOUT' });
  };
};

export const register = (creds) => {
  return async (dispatch) => {
    const res = await axios.post(userUrl + 'register', creds);
    console.log(res.data);
  };
};
