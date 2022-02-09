import React from 'react';
import { BrowserRouter as Router, Link, Redirect, Route } from 'react-router-dom'
import './App.css';
import { NetlifyLoginWrapper } from './NetlifyLoginWrapper';

const App = () => (
  <Router>
    <NetlifyLoginWrapper>
      <Route exact path="/home">
        <h1>Root Page</h1>
        <Link to="/secondary" children="go to secondary page" />
      </Route>
      <Route exact path="/secondary"><h1>Secondary Page</h1></Route>
      <Route path="*">
        <Redirect to="/home" />
      </Route>
    </NetlifyLoginWrapper>
  </Router>
)

export default App;
