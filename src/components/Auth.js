import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { useField } from '../hooks/hooks';
import { login, logout, register } from '../actions/auth';

const BaseLogin = (props) => {
  const username = useField('text');
  const password = useField('password');

  const handleSubmit = (e) => {
    e.preventDefault();
    props.login({
      username: username.value,
      password: password.value
    });
    props.history.push('/');
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

export const Login = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(BaseLogin)
);

const BaseLogout = (props) => <button onClick={props.logout}>logout</button>;

export const Logout = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseLogout);

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

export const Register = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(BaseRegister)
);
