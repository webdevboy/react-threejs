import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Login from './Login';
import Main from './Main';

class App extends Component {
  render() {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={Main} />
      </Switch>
    );
  }
}
 
export default App;
