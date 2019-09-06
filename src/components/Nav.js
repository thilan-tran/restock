import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Row, Col, Menu, Icon } from 'antd';

import { Logout } from './Auth';

const BaseNavbar = ({ auth }) => {
  const loggedIn = (
    <Menu
      theme="dark"
      mode="horizontal"
      style={{ textAlign: 'right' }}
      selectedKeys={[]}
    >
      <Menu.Item>
        <Link to={'/users/' + auth.userId}>
          <Icon type="user" />
          Me
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Logout />
      </Menu.Item>
    </Menu>
  );

  const loggedOut = (
    <Menu
      theme="dark"
      mode="horizontal"
      style={{ textAlign: 'right' }}
      selectedKeys={[]}
    >
      <Menu.Item>
        <Link to="/login">Login</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Row type="flex">
      <Col span={20}>
        <Menu theme="dark" mode="horizontal" selectedKeys={[]}>
          <Menu.Item disabled>
            <div style={{ fontSize: '20px', color: '#1890ff' }}>Restock</div>
          </Menu.Item>
          <Menu.Item key="home">
            <Link to="/stocks">Home</Link>
          </Menu.Item>
          <Menu.SubMenu title="Users">
            <Menu.Item>
              <Link to="/users">Leaderboard</Link>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu title="Stocks">
            <Menu.Item>
              <Link to="/stocks">Market Overview</Link>
            </Menu.Item>
            <Menu.Item>
              <Link to="/stocks/search">Search</Link>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item>
            <Link to="/notifications">Notifications</Link>
          </Menu.Item>
        </Menu>
      </Col>
      <Col span={4}>{auth.token ? loggedIn : loggedOut}</Col>
    </Row>
  );
};

const mapStateToProps = (state) => ({ auth: state.auth });

export const Navbar = connect(mapStateToProps)(BaseNavbar);
