import React from 'react';
import { useField } from '../hooks/hooks';

export const Login = () => {
  const username = useField('text');
  const password = useField('password');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(username.value, email.value, password.value);
  };

  return (
    <form onSubmit={handleSubmit}>
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

export const Register = () => {
  const username = useField('text');
  const email = useField('text');
  const password = useField('password');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(username.value, email.value, password.value);
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
