import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import 'antd/dist/antd.css';

import { Leaderboard, UserView } from './components/User';
import { StockList, StockSearch, StockView } from './components/Stock';
import { Register, Login, Logout } from './components/Auth';
import StockService from './services/StockService';

const { Header, Content, Footer } = Layout;

const App = (props) => {
  const [overview, setOverview] = useState({});

  useEffect(() => {
    StockService.getOverview().then((data) => setOverview(data));
  }, []);

  return (
    <Router>
      <Layout>
        <Menu mode="horizontal">
          <Menu.Item>
            <div style={{ fontSize: '20px', color: '#1890ff' }}>Restock</div>
          </Menu.Item>
          <Menu.Item>
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item>
            <Link to="/users">Users</Link>
          </Menu.Item>
          <Menu.Item>
            <Link to="/stocks">Stocks</Link>
          </Menu.Item>
          <Menu.Item style={{ float: 'right' }}>
            <Link to="/register">Register</Link>
          </Menu.Item>
          <Menu.Item style={{ float: 'right' }}>
            <Link to="/login">Login</Link>
          </Menu.Item>
        </Menu>

        <Content style={{ padding: '0 50px' }}>
          <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
            <Route
              exact
              path="/"
              render={() => <StockList stocks={overview.most_active} />}
            />
            <Route exact path="/stocks" render={() => <StockSearch />} />
            <Route
              exact
              path="/stocks/:symbol"
              render={({ match }) => <StockView symbol={match.params.symbol} />}
            />
            <Route exact path="/users" render={() => <Leaderboard />} />
            <Route
              exact
              path="/users/:id"
              render={({ match }) => (
                <UserView id={Number(match.params.id)} socket={props.socket} />
              )}
            />
            <Route exact path="/login" render={() => <Login />} />
            <Route exact path="/register" render={() => <Register />} />
          </div>
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          Created by Thilan Tran 2019
        </Footer>
      </Layout>
    </Router>
  );
};

const mapStateToProps = (state) => {
  return { auth: state.auth, leaderboard: state.leaderboard };
};

export default connect(mapStateToProps)(App);
