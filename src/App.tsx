import React, { useCallback } from 'react'
import { BrowserRouter as Router, Link, Redirect, Route } from 'react-router-dom'
import NetlifyOAuthWrapper from './NetlifyOAuthWrapper'
import { NetlifyOAuthProvider } from './enums'
import { UserProfile } from './types'

const App = () => {
  const handleLogin = useCallback((provider: NetlifyOAuthProvider, profile: UserProfile) => {
    console.log(provider, profile)
    switch (provider) {
      case NetlifyOAuthProvider.github:
        return profile.login.toLowerCase() === 'elviskrop' ? Promise.resolve() : Promise.reject()
      case NetlifyOAuthProvider.gitlab:
        return profile.username.toLowerCase() === 'n.zasimuk' ? Promise.resolve() : Promise.reject()
      default:
        return Promise.reject()
    }
  }, [])

  return (
    <Router>
      <NetlifyOAuthWrapper
        handleLogin={handleLogin}
        acceptedProviders={[NetlifyOAuthProvider.github, NetlifyOAuthProvider.gitlab]}
        apiId={process.env?.REACT_APP_NETLIFY_API_ID}
      >
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
}

export default App
