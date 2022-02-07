import React from 'react';
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'
import './App.css';
import { NetlifyLoginWrapper } from './NetlifyLoginWrapper';

const App = () => (
    <div className="App">
      <Router>
        <NetlifyLoginWrapper>
          <Route exact path="/home" render={() => <h1>Root Page</h1>} />
          <Route exact path="/secondary" render={() => <h1>Secondary Page</h1>}/>
          <Route component={() => <Redirect to="/home" />} />
        </NetlifyLoginWrapper>
      </Router>
    </div>
  )

export default App;
