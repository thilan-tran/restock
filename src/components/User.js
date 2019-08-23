import React from 'react';

export const UserOverview = ({ user }) => {
  const stocks = user.stocks.map((s) => (
    <p key={s.id}>
      {s.symbol.toUpperCase()} {s.short ? 'short' : 'stock'} bought for $
      {s.buy_price}, now ${s.current_price} at {s.timestamp}
    </p>
  ));

  return (
    <div>
      <h1>{user.username}</h1>
      {stocks}
    </div>
  );
};
