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
      <Menu.SubMenu
        title={
          <span>
            <Icon type="user" />
            {auth.username}
          </span>
        }
      >
        <Menu.Item>
          <Link to={'/users/' + auth.userId}>Overview</Link>
        </Menu.Item>
        <Menu.Item>
          <Logout />
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );

  const loggedOut = (
    <Menu
      theme="dark"
      mode="horizontal"
      style={{ textAlign: 'right' }}
      selectedKeys={[]}
    >
      <Menu.SubMenu
        title={
          <span>
            <Icon type="login" />
            Login
          </span>
        }
      >
        <Menu.Item>
          <Link to="/login">Login</Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/register">Register</Link>
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );

  return (
    <Row type="flex">
      <Col span={20}>
        <Menu theme="dark" mode="horizontal" selectedKeys={[]}>
          <Menu.Item disabled>
            <div style={{ fontSize: '20px', color: '#1890ff' }}>Restock</div>
          </Menu.Item>

          <Menu.SubMenu
            title={
              <span>
                <Icon type="home" />
                Home
              </span>
            }
          >
            <Menu.Item key="home">
              <Link to="/stocks">Market Overview</Link>
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu
            title={
              <span>
                <Icon type="usergroup-add" />
                Users
              </span>
            }
          >
            <Menu.Item>
              <Link to="/users">Leaderboard</Link>
            </Menu.Item>
            <Menu.Item>
              <Link to="/users/search">Search</Link>
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu
            title={
              <span>
                <Icon type="stock" />
                Stocks
              </span>
            }
          >
            <Menu.Item>
              <Link to="/stocks">Market Overview</Link>
            </Menu.Item>
            <Menu.Item>
              <Link to="/stocks/search">Search</Link>
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu
            title={
              <span>
                <Icon type="notification" />
                Notifications
              </span>
            }
          >
            <Menu.Item>
              <Link to="/notifications/users">Users</Link>
            </Menu.Item>
            <Menu.Item>
              <Link to="/notifications/stocks">Stocks</Link>
            </Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </Col>
      <Col span={4}>{auth.token ? loggedIn : loggedOut}</Col>
    </Row>
  );
};

const mapStateToProps = (state) => ({ auth: state.auth });

export const Navbar = connect(mapStateToProps)(BaseNavbar);
