import React, { useCallback } from 'react'
import { BrowserRouter as Router, Link, Redirect, Route } from 'react-router-dom'
import NetlifyOAuthWrapper from './NetlifyOAuthWrapper'
import { NetlifyOAuthProvider } from './enums'
import { UserProfile } from './types'
import { allProviders } from './constants'

enum OwnerUsername {
  github = 'elviskrop',
  gitlab = 'n.zasimuk',
  bitbucket = 'n_zasimuk',
}

const App = () => {
  const acceptedProviders = (process.env?.REACT_APP_ACCEPTED_PROVIDERS?.trim()
    ?.toLowerCase()
    .split(',')
    .filter((provider) => allProviders.includes(provider as NetlifyOAuthProvider)) ||
    []) as NetlifyOAuthProvider[]

  const handleLogin = useCallback((provider: NetlifyOAuthProvider, profile: UserProfile) => {
    console.log(provider, profile)
    switch (provider) {
      case NetlifyOAuthProvider.github:
        return 'login' in profile && profile.login.toLowerCase() === OwnerUsername.github
          ? Promise.resolve()
          : Promise.reject('Not allowed user')
      case NetlifyOAuthProvider.gitlab:
        return 'username' in profile && profile.username.toLowerCase() === OwnerUsername.gitlab
          ? Promise.resolve()
          : Promise.reject('Not allowed user')
      case NetlifyOAuthProvider.bitbucket:
        return 'username' in profile && profile.username.toLowerCase() === OwnerUsername.bitbucket
          ? Promise.resolve()
          : Promise.reject('Not allowed user')
      default:
        return Promise.reject('Not allowed user')
    }
  }, [])

  return (
    <Router>
      <NetlifyOAuthWrapper
        handleLogin={handleLogin}
        acceptedProviders={acceptedProviders}
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
