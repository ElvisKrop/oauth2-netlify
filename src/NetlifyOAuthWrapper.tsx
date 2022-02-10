import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GithubService } from './services/github.service'
import { Redirect, Route } from 'react-router-dom'
import { NetlifyService } from './services/netlify.service'
import { NetlifyOAuthProvider } from './enums'
import { NetlifyOAuthWrapperProps, UserProfile } from './types'
import { allProviders } from './constants'
import { GitlabService } from './services/gitlab.service'

const defaultLoginHandler = (_: NetlifyOAuthProvider, userProfile: UserProfile) =>
  new Promise<void>((resolve, reject) => (userProfile ? resolve() : reject('No profile')))

const NetlifyOAuthWrapper = ({
  apiId,
  acceptedProviders = allProviders,
  handleLogin = defaultLoginHandler,
  children,
}: NetlifyOAuthWrapperProps) => {
  const [provider, setProvider] = useState(allProviders[0])
  const netlifyService = useMemo(() => (apiId ? NetlifyService.getInstance(apiId) : null), [apiId])
  const [userProfile, setUserProfile] = useState<null | undefined | UserProfile>(undefined)
  const githubService = useMemo(() => new GithubService(), [])
  const gitlabService = useMemo(() => new GitlabService(), [])

  const resetProfile = useCallback(
    (error?: unknown) => {
      if (error) console.error(error)
      githubService.storage.removeStoredToken()
      setUserProfile(null)
    },
    [githubService.storage],
  )

  useEffect(() => {
    if (githubService.storage.isStoredTokenValid() && netlifyService) {
      // TODO: insert login handler before setting profile
      githubService.getUserProfile().then(setUserProfile).catch(resetProfile)
    } else {
      resetProfile()
    }
  }, [githubService, netlifyService, resetProfile])

  const handleLoginClick = useCallback(async () => {
    if (!netlifyService) return

    try {
      const token = await netlifyService.auth(provider)
      let newProfile

      switch (provider) {
        case NetlifyOAuthProvider.github:
          githubService.storage.setToken(token)
          newProfile = await githubService.getUserProfile()
          break
        case NetlifyOAuthProvider.gitlab:
          gitlabService.storage.setToken(token)
          newProfile = await gitlabService.getUserProfile()
          console.log(token)
          break
        case NetlifyOAuthProvider.bitbucket:
          console.log(token)
          break
      }

      await handleLogin(provider, newProfile)
      setUserProfile(newProfile)
    } catch (err) {
      resetProfile(err)
    }
  }, [netlifyService, provider, handleLogin, githubService, gitlabService, resetProfile])

  return userProfile === null && apiId ? (
    <>
      <Route exact path="/login">
        <div
          style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <div style={{ margin: '10px' }}>
            {acceptedProviders?.length > 1 &&
              acceptedProviders.map((currentProvider) => (
                <div key={currentProvider}>
                  <input
                    type="radio"
                    name="provider"
                    id={currentProvider}
                    value={currentProvider}
                    checked={provider === currentProvider}
                    onChange={() => setProvider(currentProvider)}
                  />
                  <label htmlFor={currentProvider}>{currentProvider}</label>
                </div>
              ))}
          </div>
          <button onClick={handleLoginClick}>Sign In!</button>
        </div>
      </Route>
      <Route path="*">
        <Redirect to="/login" />
      </Route>
    </>
  ) : (
    <>{children}</>
  )
}

export default NetlifyOAuthWrapper
