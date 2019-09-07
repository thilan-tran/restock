import socketIO from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import App from './App';
import usersReducer from './reducers/usersReducer';
import { setLeaderboard, updateSubscribed } from './actions/users';
import { initTracking, updateTracking } from './actions/tracking';

const socket = socketIO.connect(window.location.host);

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

socket.on('leaderboard', (data) => {
  const userIds = JSON.parse(data);
  console.log(userIds);
  store.dispatch(setLeaderboard(userIds));
});

socket.on('update', (data) => {
  const jsonData = JSON.parse(data);
  console.log(jsonData);
  store.dispatch(updateSubscribed(jsonData));
});

socket.on('update_tracking', (data) => {
  const tracking = JSON.parse(data);
  console.log(tracking);
  store.dispatch(
    updateTracking(tracking.symbol, tracking.price, tracking.prev_price)
  );
});

ReactDOM.render(
  <Provider store={store}>
    <App socket={socket} />
  </Provider>,
  document.getElementById('root')
);
