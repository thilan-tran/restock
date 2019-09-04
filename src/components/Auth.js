import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import { useField } from '../hooks/hooks';
import { login, logout, register } from '../actions/auth';

import { Row, Col, Form, Icon, Input, Button } from 'antd';

const BaseLoginForm = (props) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props.login({
          username: values.username,
          password: values.password
        });
        console.log(props.history);
        // props.history.goBack();
      }
    });
  };
  const { getFieldDecorator } = props.form;

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

const BaseLogin = (props) => {
  const username = useField('text');
  const password = useField('password');

  const handleSubmit = (e) => {
    e.preventDefault();
    props.login({
      username: username.value,
      password: password.value
    });
    console.log(props.history);
    props.history.goBack();
    // props.history.push('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>{props.auth.token}</p>
      <p>{props.auth.userId}</p>
      <h2>Login</h2>
      <div>
        Username:
        <input {...username} />
      </div>
      <div>
        Password:
        <input {...password} />
      </div>
      <button type="submit">submit</button>
    </form>
  );
};

const mapStateToProps = (state) => ({ auth: state.auth });

const mapDispatchToProps = { login, logout, register };

// export const Login = withRouter(
//   connect(
//     mapStateToProps,
//     mapDispatchToProps
//   )(BaseLogin)
// );

export const Login = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Form.create({ name: 'login' })(BaseLoginForm))
);

const BaseLogout = (props) => <button onClick={props.logout}>logout</button>;

export const Logout = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseLogout);

const BaseRegisterForm = (props) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props.register({
          username: values.username,
          email: values.email,
          password: values.password
        });
        props.history.push('/login');
      }
    });
  };
  const { getFieldDecorator } = props.form;

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

const BaseRegister = (props) => {
  const username = useField('text');
  const email = useField('text');
  const password = useField('password');

  const handleSubmit = (e) => {
    e.preventDefault();
    props.register({
      username: username.value,
      email: email.value,
      password: password.value
    });
    props.history.push('/login');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <div>
        Username:
        <input {...username} />
      </div>
      <div>
        Email:
        <input {...email} />
      </div>
      <div>
        Password:
        <input {...password} />
      </div>
      <button type="submit">submit</button>
    </form>
  );
};

// export const Register = withRouter(
//   connect(
//     mapStateToProps,
//     mapDispatchToProps
//   )(BaseRegister)
// );

export const Register = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Form.create({ name: 'register' })(BaseRegisterForm))
);
