import axios from 'axios';

const baseUrl = '/api/users';

const register = (creds) =>
  axios.post(baseUrl + '/register', creds).then((res) => res.data);

const login = (creds) =>
  axios.post(baseUrl + '/login', creds).then((res) => res.data);

export default { login };
