import React from 'react';
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'
import './App.css';
import { NetlifyLoginWrapper } from './NetlifyLoginWrapper';

const App = () => (
    <div className="App">
      <Router>
        <NetlifyLoginWrapper>
          <Route exact path="/home">
            <h1>Root Page</h1>
          </Route>
          <Route exact path="/secondary"><h1>Secondary Page</h1></Route>
          <Route path="*">
            <Redirect to="/home" />
          </Route>
        </NetlifyLoginWrapper>
      </Router>
    </div>
  )

export default App;
