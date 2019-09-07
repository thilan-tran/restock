import axios from 'axios';

const baseUrl = '/api/stocks';
const userUrl = '/api/users';

const getOverview = () =>
  axios.get(baseUrl + '/overview').then((res) => res.data);

const getBySymbol = (symbol) =>
  axios.get(baseUrl + '/' + symbol).then((res) => res.data);

const getSearchResults = (search) =>
  axios.get(baseUrl + '/search/' + search).then((res) => res.data);

const getUserSearch = (search) =>
  axios.get(userUrl + '/search/' + search).then((res) => res.data);

export default { getOverview, getBySymbol, getSearchResults, getUserSearch };
