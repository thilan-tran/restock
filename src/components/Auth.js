import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import { login, logout, register } from '../actions/auth';

import { Row, Col, Form, Icon, Input, Button, Checkbox } from 'antd';

const mapDispatchToProps = { login, logout, register };

const BaseLogin = ({ form, login, history }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        login(
          {
            username: values.username,
            password: values.password
          },
          values.remember
        )
          .then(() => history.goBack())
          .catch((err) => console.error(err));
      }
    });
  };

  const { getFieldDecorator } = form;

  return (
    <Row type="flex" justify="center">
      <Col span={8}>
        <h1>
          <em>Login</em>
        </h1>
        <br />
        <Form onSubmit={handleSubmit}>
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [{ required: true, message: 'Username required.' }]
            })(
              <Input
                prefix={
                  <Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                placeholder="Username"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Password required.' }]
            })(
              <Input
                prefix={
                  <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                type="password"
                placeholder="Password"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true
            })(<Checkbox>Remember me</Checkbox>)}
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Log in
            </Button>
            <Link to="/register" style={{ float: 'right' }}>
              Register
            </Link>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export const Login = withRouter(
  connect(
    null,
    mapDispatchToProps
  )(Form.create({ name: 'login' })(BaseLogin))
);

const BaseLogout = ({ logout }) => <a onClick={logout}>Logout</a>;

export const Logout = connect(
  null,
  mapDispatchToProps
)(BaseLogout);

const BaseRegister = ({ form, register, history }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        register({
          username: values.username,
          email: values.email,
          password: values.password
        })
          .then(() => history.push('/login'))
          .catch((err) => console.error(err));
      }
    });
  };
  const { getFieldDecorator } = form;

  return (
    <Row type="flex" justify="center">
      <Col span={8}>
        <h1>
          <em>Register</em>
        </h1>
        <br />
        <Form onSubmit={handleSubmit}>
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [{ required: true, message: 'Username required.' }]
            })(
              <Input
                prefix={
                  <Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                placeholder="Username"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('email', {
              rules: [{ required: true, message: 'Email required.' }]
            })(
              <Input
                prefix={
                  <Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                placeholder="Email"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Password required.' }]
            })(
              <Input
                prefix={
                  <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                type="password"
                placeholder="Password"
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Register
            </Button>
            <Link to="/login" style={{ float: 'right' }}>
              Login
            </Link>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export const Register = withRouter(
  connect(
    null,
    mapDispatchToProps
  )(Form.create({ name: 'register' })(BaseRegister))
);
