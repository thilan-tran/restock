import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserOverview } from './components/User';
import { Register } from './components/Auth';

const App = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/users/').then((res) => {
      console.log(res.data);
      setUsers(res.data);
    });
  }, []);

  const overviews = users.map((u) => <UserOverview key={u.id} user={u} />);

  return (
    <div>
      <h1>testing</h1>
      {overviews}
      <Register />
    </div>
  );
};

export default App;
