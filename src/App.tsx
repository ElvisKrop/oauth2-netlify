import React, { useCallback } from 'react'
import { BrowserRouter as Router, Link, Redirect, Route } from 'react-router-dom'
import NetlifyOAuthWrapper from './NetlifyOAuthWrapper'
import { NetlifyOAuthProvider } from './enums'
import { UserProfile } from './types'
import HomePage from './HomePage'
import { allProviders } from './constants'

const App = () => {
  const acceptedProviders = (process.env?.REACT_APP_ACCEPTED_PROVIDERS?.trim()
    ?.toLowerCase()
    .split(',')
    .filter((provider) => allProviders.includes(provider as NetlifyOAuthProvider)) ||
    []) as NetlifyOAuthProvider[]

  const handleLogin = useCallback((provider: NetlifyOAuthProvider, profile: UserProfile) => {
    console.log(provider, profile)
    return Promise.resolve()
  }, [])

  return (
    <Router>
      <NetlifyOAuthWrapper
        handleLogin={handleLogin}
        acceptedProviders={acceptedProviders}
        apiId={process.env?.REACT_APP_NETLIFY_API_ID}
      >
        <Route exact path="/home">
          <HomePage />
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
