import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import axios from 'axios';
import { path, isEmpty } from 'ramda';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();


  const logIn = () => {

    // Set error if username and password fields is empty
    if(isEmpty(username) || isEmpty(password)) {
      setError('Please, fill username and password');
      return;
    };

    // Login request
    axios.post('http://localhost:3000/login', { username, password }).then(res => {
      if(path(['data', 'info', 'status'], res) === 'ok') {
        sessionStorage.setItem('user', JSON.stringify(path(['data', 'user'], res)));
        history.push('/');
      }
      else {
        setError(path(['data', 'error'], res));
      }
    })
    .catch(err => console.log(err));
  }

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if(user) {
      history.replace('/');
    }
  }, []);

  return (
    <div className="login-container">
      <h1>Log In</h1>
      {error && <div className="block error-block">{error}</div>}
      <div className="block">
        <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div className="block">
        <input className="input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <button className="button is-primary" onClick={logIn}>Log In</button>
    </div>
  );
};

export default Login;
