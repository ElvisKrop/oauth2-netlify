import React from 'react'
import { BrowserRouter as Router, Link, Redirect, Route } from 'react-router-dom'
import NetlifyOAuthWrapper from './NetlifyOAuthWrapper'

const App = () => (
  <Router>
    <NetlifyOAuthWrapper apiId={process.env?.REACT_APP_NETLIFY_API_ID}>
      <Route exact path="/home">
        <h1>Root Page</h1>
        <Link to="/secondary">go to secondary page</Link>
      </Route>
      <Route exact path="/secondary">
        <h1>Secondary Page</h1>
        <Link to="/home">go to home page</Link>
      </Route>
      <Route path="*">
        <Redirect to="/home" />
      </Route>
    </NetlifyOAuthWrapper>
  </Router>
)

export default App
