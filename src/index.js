import socketIO from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import App from './App';
import usersReducer from './reducers/usersReducer';
import { setLeaderboard, updateSubscribed } from './actions/users';

const socket = socketIO.connect('http://localhost:3000');

const store = createStore(
  usersReducer,
  compose(
    applyMiddleware(thunk.withExtraArgument(socket)),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

socket.on('connect', () => {
  console.log('Websocket connected');
});

socket.on('message', (msg) => console.log(msg));

socket.on('update', (data) => {
  const user = JSON.parse(data);
  console.log(user);
  store.dispatch(updateSubscribed(user));
});

socket.on('leaderboard', (data) => {
  const users = JSON.parse(data);
  console.log(users);
  store.dispatch(setLeaderboard(users));
});

ReactDOM.render(
  <Provider store={store}>
    <App socket={socket} />
  </Provider>,
  document.getElementById('root')
);
