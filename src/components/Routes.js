import React from 'react';
import { Switch, Route, Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { Menu, Breadcrumb } from 'antd';

import { StockList, StockSearch, StockView } from './Stock';
import { UserNotifications, StockNotifications } from './Notification';
import { Leaderboard, UserSearch, UserView } from './User';
import { Login, Register } from './Auth';

export const userMenu = (
  <Menu.SubMenu title="Users">
    <Menu.Item>
      <Link to="/users">Leaderboard</Link>
    </Menu.Item>
    <Menu.Item>
      <Link to="/users/search">Search</Link>
    </Menu.Item>
  </Menu.SubMenu>
);

export const stockMenu = (
  <Menu.SubMenu title="Stocks">
    <Menu.Item>
      <Link to="/stocks">Market Overview</Link>
    </Menu.Item>
    <Menu.Item>
      <Link to="/stocks/search">Search</Link>
    </Menu.Item>
  </Menu.SubMenu>
);

export const notificationMenu = (
  <Menu.SubMenu title="Notifications">
    <Menu.Item>
      <Link to="/notifications/users">Users</Link>
    </Menu.Item>
    <Menu.Item>
      <Link to="/notifications/stocks">Stocks</Link>
    </Menu.Item>
  </Menu.SubMenu>
);

export const baseMenu = (
  <Menu>
    <Menu.SubMenu title="Home">
      <Menu.Item key="home">
        <Link to="/stocks">Market Overview</Link>
      </Menu.Item>
    </Menu.SubMenu>

    {userMenu}

    {stockMenu}

    {notificationMenu}
  </Menu>
);

const BaseRoutes = ({ auth }) => (
  <Switch>
    <Route exact path="/" render={() => <Redirect to="/stocks" />} />

    <Route
      exact
      path="/stocks"
      render={() => (
        <div>
          <StockList />
        </div>
      )}
    />

    <Route
      exact
      path="/stocks/search"
      render={() => (
        <div>
          <Breadcrumb style={{ margin: '16px' }}>
            <Breadcrumb.Item overlay={baseMenu}>Stocks</Breadcrumb.Item>
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
            <Breadcrumb.Item overlay={baseMenu}>Stocks</Breadcrumb.Item>
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
      path="/users/search"
      render={() => (
        <div>
          <Breadcrumb style={{ margin: '16px' }}>
            <Breadcrumb.Item overlay={baseMenu}>Users</Breadcrumb.Item>
            <Breadcrumb.Item>Search</Breadcrumb.Item>
          </Breadcrumb>
          <UserSearch />
        </div>
      )}
    />

    <Route
      exact
      path="/users/:id"
      render={({ match }) => (
        <div>
          <Breadcrumb style={{ margin: '16px' }}>
            <Breadcrumb.Item overlay={baseMenu}>Users</Breadcrumb.Item>
            <Breadcrumb.Item>{match.params.id}</Breadcrumb.Item>
          </Breadcrumb>
          <UserView id={Number(match.params.id)} />
        </div>
      )}
    />

    <Route
      exact
      path="/notifications/users"
      render={() => (
        <div>
          <Breadcrumb style={{ margin: '16px' }}>
            <Breadcrumb.Item overlay={baseMenu}>Notifications</Breadcrumb.Item>
            <Breadcrumb.Item>Users</Breadcrumb.Item>
          </Breadcrumb>
          <UserNotifications />
        </div>
      )}
    />

    <Route
      exact
      path="/notifications/stocks"
      render={() => (
        <div>
          <Breadcrumb style={{ margin: '16px' }}>
            <Breadcrumb.Item overlay={baseMenu}>Notifications</Breadcrumb.Item>
            <Breadcrumb.Item>Stocks</Breadcrumb.Item>
          </Breadcrumb>
          <StockNotifications />
        </div>
      )}
    />

    <Route
      exact
      path="/login"
      render={() =>
        auth.userId ? (
          <Redirect to={'/users/' + auth.userId} />
        ) : (
          <div>
            <Breadcrumb style={{ margin: '16px' }}>
              <Breadcrumb.Item overlay={baseMenu}>Users</Breadcrumb.Item>
              <Breadcrumb.Item>Login</Breadcrumb.Item>
            </Breadcrumb>
            <Login />
          </div>
        )
      }
    />

    <Route
      exact
      path="/register"
      render={() =>
        auth.userId ? (
          <Redirect to={'/users/' + auth.userId} />
        ) : (
          <div>
            <Breadcrumb style={{ margin: '16px' }}>
              <Breadcrumb.Item overlay={baseMenu}>Users</Breadcrumb.Item>
              <Breadcrumb.Item>Register</Breadcrumb.Item>
            </Breadcrumb>
            <Register />
          </div>
        )
      }
    />
  </Switch>
);

const mapStateToProps = (state) => ({ auth: state.auth });

export const Routes = connect(mapStateToProps)(BaseRoutes);
