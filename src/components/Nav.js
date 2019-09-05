import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Row, Col, Menu } from 'antd';

import { Logout } from './Auth';

const BaseNavbar = ({ auth }) => (
  <Row type="flex">
    <Col span={20}>
      <Menu theme="dark" mode="horizontal">
        <Menu.Item disabled>
          <div style={{ fontSize: '20px', color: '#1890ff' }}>Restock</div>
        </Menu.Item>
        <Menu.Item key="home">
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/users">Users</Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/stocks">Stocks</Link>
        </Menu.Item>
      </Menu>
    </Col>
    <Col span={4}>
      <Menu theme="dark" mode="horizontal" style={{ textAlign: 'right' }}>
        {auth.token ? (
          <Menu.Item>
            <Logout />
          </Menu.Item>
        ) : (
          <Menu.Item>
            <Link to="/login">Login</Link>
          </Menu.Item>
        )}
      </Menu>
    </Col>
  </Row>
);

const mapStateToProps = (state) => ({ auth: state.auth });

export const Navbar = connect(mapStateToProps)(BaseNavbar);
