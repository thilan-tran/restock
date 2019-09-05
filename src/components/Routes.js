import React from 'react';
import { Route, Link } from 'react-router-dom';

import { Breadcrumb } from 'antd';

import { StockList, StockSearch, StockView } from './Stock';
import { Leaderboard, UserView } from './User';
import { Login, Register } from './Auth';

export const Routes = () => (
  <div>
    <Route
      exact
      path="/"
      render={() => (
        <div>
          <StockList />
        </div>
      )}
    />
    <Route
      exact
      path="/stocks"
      render={() => (
        <div>
          <Breadcrumb style={{ margin: '16px' }}>
            <Breadcrumb.Item>
              <Link to="/stocks">Stocks</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Search</Breadcrumb.Item>
          </Breadcrumb>
          <StockSearch />
        </div>
      )}
    />
    <Route
      exact
      path="/stocks/:symbol"
      render={({ match }) => (
        <div>
          <Breadcrumb style={{ margin: '16px' }}>
            <Breadcrumb.Item>
              <Link to="/stocks">Stocks</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {match.params.symbol.toUpperCase()}
            </Breadcrumb.Item>
          </Breadcrumb>
          <StockView symbol={match.params.symbol} />
        </div>
      )}
    />
    <Route exact path="/users" render={() => <Leaderboard />} />
    <Route
      exact
      path="/users/:id"
      render={({ match }) => (
        <div>
          <Breadcrumb style={{ margin: '16px' }}>
            <Breadcrumb.Item>
              <Link to="/users">Users</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{match.params.id}</Breadcrumb.Item>
          </Breadcrumb>
          <UserView id={Number(match.params.id)} />
        </div>
      )}
    />
    <Route
      exact
      path="/login"
      render={() => (
        <div>
          <Breadcrumb style={{ margin: '16px' }}>
            <Breadcrumb.Item>
              <Link to="/users">Users</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Login</Breadcrumb.Item>
          </Breadcrumb>
          <Login />
        </div>
      )}
    />
    <Route
      exact
      path="/register"
      render={() => (
        <div>
          <Breadcrumb style={{ margin: '16px' }}>
            <Breadcrumb.Item>
              <Link to="/users">Users</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Register</Breadcrumb.Item>
          </Breadcrumb>
          <Register />
        </div>
      )}
    />
  </div>
);
