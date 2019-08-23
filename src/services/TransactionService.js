import axios from 'axios';

const baseUrl = '/api/transactions';

let token = null;

const setToken = (newToken) => (token = `bearer ${newToken}`);

const getAll = () => axios.get(baseUrl + '/aggregate').then((res) => res.data);

const getById = (id) => axios.get(baseUrl + '/' + id).then((res) => res.data);

const create = (blog) => {
  const config = {
    headers: { Authorization: token }
  };
  return axios.post(baseUrl, blog, config).then((res) => res.data);
};

const remove = (id) => {
  const config = {
    headers: { Authorization: token }
  };
  return axios.delete(baseUrl + '/' + id, config).then((res) => res.data);
};

export default { setToken, getAll, getById, create, remove };
