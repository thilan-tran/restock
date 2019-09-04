import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Link
} from 'react-router-dom';

import { Icon, Row, Col, Layout, Menu, Breadcrumb, PageHeader } from 'antd';
import 'antd/dist/antd.css';
import { Leaderboard, UserView } from './components/User';
import { StockList, StockSearch, StockView } from './components/Stock';
import { Register, Login, Logout } from './components/Auth';

import StockService from './services/StockService';
import { initLeaderboard } from './actions/users';
import { initOverview, addTracking } from './actions/tracking';

const { Header, Content, Footer } = Layout;

const App = (props) => {
  useEffect(() => {
    props.initLeaderboard();
    // props.initOverview();
  }, []);

  return (
    <Router>
      <Layout style={{ height: '100%' }}>
        <Row type="flex">
          <Col span={20}>
            <Menu theme="dark" mode="horizontal">
              <Menu.Item disabled>
                <div style={{ fontSize: '20px', color: '#1890ff' }}>
                  Restock
                </div>
              </Menu.Item>
              <Menu.Item key="home">
                <NavLink to="/">Home</NavLink>
              </Menu.Item>
              <Menu.Item>
                <NavLink to="/users">Users</NavLink>
              </Menu.Item>
              <Menu.Item>
                <NavLink to="/stocks">Stocks</NavLink>
              </Menu.Item>
            </Menu>
          </Col>
          <Col span={4}>
            <Menu theme="dark" mode="horizontal" style={{ textAlign: 'right' }}>
              {props.auth.token ? (
                <Menu.Item>
                  <Icon type="logout" />
                  Logout
                </Menu.Item>
              ) : (
                <Menu.Item>
                  <NavLink to="/login">Login</NavLink>
                </Menu.Item>
              )}
            </Menu>
          </Col>
        </Row>

        <Content style={{ padding: '0 50px', minHeight: 750 }}>
          <Route
            exact
            path="/"
            render={() => (
              <div>
                <StockList stocks={props.tracking} />
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
          <Route
            exact
            path="/users"
            render={() => (
              <div>
                <Leaderboard />
              </div>
            )}
          />
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
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          Created by Thilan Tran 2019
        </Footer>
      </Layout>
    </Router>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  tracking: state.tracking
});

const mapDispatchToProps = { initLeaderboard, initOverview, addTracking };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
