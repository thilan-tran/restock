import axios from 'axios';

const baseUrl = '/api/stocks';

const getOverview = () =>
  axios.get(baseUrl + '/overview').then((res) => res.data);

const getBySymbol = (symbol) =>
  axios
    .get(baseUrl + '/' + symbol)
    .then((res) => res.data)
    .catch((err) => console.log(err.response.data));

const getSearchResults = (search) =>
  axios
    .get(baseUrl + '/search/' + search)
    .then((res) => res.data)
    .catch((err) => console.log(err.response.data));

export default { getOverview, getBySymbol, getSearchResults };
