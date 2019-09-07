import axios from 'axios';

const baseUrl = '/api/transactions/';

let token = null;

const setToken = (newToken) => (token = `bearer ${newToken}`);

const getAll = () => axios.get(baseUrl + 'aggregate').then((res) => res.data);

const getById = (id) => axios.get(baseUrl + id).then((res) => res.data);

const create = (data) => {
  const config = {
    headers: { Authorization: token }
  };
  return axios.post(baseUrl, data, config).then((res) => res.data);
};

const remove = (id) => {
  const config = {
    headers: { Authorization: token }
  };
  return axios.delete(baseUrl + '/' + id, config).then((res) => res.data);
};

export default { setToken, getAll, getById, create, remove };

import TransactionService from '../services/TransactionService';

const initState = {
  token: '',
  userId: ''
};

const authReducer = (state = initState, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, ...action.data };
    default:
      return state;
  }
};

export const login = (data) => {
  TransactionService.setToken(data.auth_token);
  return {
    type: 'LOGIN',
    data: {
      token: data.auth_token,
      userId: data.user_id
    }
  };
};

export default authReducer;
