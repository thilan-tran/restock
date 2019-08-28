import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  initLeaderboard,
  addSubscribed,
  removeSubscribed
} from '../actions/users';

export const UserOverview = ({ user }) => {
  const dailyRecords = user.records.daily_records;
  const latestWorth = dailyRecords[dailyRecords.length - 1].worth;

  const change = user.worth - latestWorth;
  const percentChange = change / latestWorth;

  return (
    <div>
      <Link to={'/users/' + user.id}>
        <h1>{user.username}</h1>
      </Link>
      <p>
        Balance: ${user.balance.toFixed(2)} Worth: ${user.worth.toFixed(2)}{' '}
        Worth Change: ${change.toFixed(2)} {percentChange.toFixed(4)}% ID:{' '}
        {user.id}
      </p>
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  leaderboard: state.leaderboard,
  subscribed: state.subscribed
});

const mapDispatchToProps = { addSubscribed, removeSubscribed, initLeaderboard };

const BaseUserView = ({
  id,
  addSubscribed,
  removeSubscribed,
  subscribed,
  socket
}) => {
  useEffect(() => {
    addSubscribed(id);
    socket.emit('subscribe', id);

    return () => {
      removeSubscribed(id);
      socket.emit('unsubscribe', id);
    };
  }, []);

  const user = subscribed.find((u) => u.id === id);
  if (!user) return <p>loading...</p>;

  const stocks = user.portfolio.map((s) => {
    console.log(s);
    const change = s.shares * (s.current_price - s.init_price);
    const percentChange = change / (s.shares * s.init_price);

    return (
      <p key={s.id}>
        {s.shares}{' '}
        <Link to={'/stocks/' + s.symbol}>{s.symbol.toUpperCase()}</Link>{' '}
        {s.short ? 'short' : 'stock'} bought for ${s.init_price}, now $
        {s.current_price} at {s.timestamp} Change: ${change.toFixed(2)}{' '}
        {percentChange.toFixed(4)}%
      </p>
    );
  });

  return (
    <div>
      <UserOverview user={user} />
      {stocks}
    </div>
  );
};

export const UserView = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseUserView);

const BaseLeaderboard = (props) => {
  useEffect(() => {
    props.initLeaderboard();
  }, []);

  return (
    <div>
      {props.leaderboard.map((u) => (
        <UserOverview key={u.id} user={u} />
      ))}
    </div>
  );
};

export const Leaderboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseLeaderboard);
