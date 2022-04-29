import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react'
import { GithubService } from './services/github.service'
import { Redirect, Route } from 'react-router-dom'
import { NetlifyService } from './services/netlify.service'
import { NetlifyOAuthProvider } from './enums'
import { NetlifyOAuthWrapperProps, UserProfile } from './types'
import { allProviders } from './constants'
import { GitlabService } from './services/gitlab.service'
import { BitbucketService } from './services/bitbucket.service'

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  radioButtons: { margin: '10px' },
}

const defaultLoginHandler = (_: NetlifyOAuthProvider, userProfile: UserProfile) =>
  new Promise<void>((resolve, reject) => (userProfile ? resolve() : reject('No profile')))

/**
 * @param apiId
 * @param acceptedProviders
 * @param handleLogin
 * @param children
 */
const NetlifyOAuthWrapper = ({
  apiId,
  acceptedProviders = allProviders,
  handleLogin = defaultLoginHandler,
  children,
}: NetlifyOAuthWrapperProps) => {
  const [provider, setProvider] = useState(allProviders[0])
  const netlifyService = useMemo(() => new NetlifyService(apiId), [apiId])
  const [userProfile, setUserProfile] = useState<null | undefined | UserProfile>(undefined)
  // TODO: probably it is better to merge those services
  const githubService = useMemo(() => new GithubService(), [])
  const gitlabService = useMemo(() => new GitlabService(), [])
  const bitbucketService = useMemo(() => new BitbucketService(), [])

  const resetProfile = useCallback(
    (error?: unknown) => {
      if (error) console.error(error)
      githubService.storage.removeStoredToken()
      gitlabService.storage.removeStoredToken()
      bitbucketService.storage.removeStoredToken()
      setUserProfile(null)
    },
    [bitbucketService.storage, githubService.storage, gitlabService.storage],
  )

  useEffect(() => {
    if (netlifyService) {
      if (githubService.storage.isStoredTokenValid()) {
        // TODO: insert login handler before setting profile
        githubService.getUserProfile().then(setUserProfile).catch(resetProfile)
      } else if (gitlabService.storage.isStoredTokenValid()) {
        gitlabService.getUserProfile().then(setUserProfile).catch(resetProfile)
      } else if (bitbucketService.storage.isStoredTokenValid()) {
        bitbucketService.getUserProfile().then(setUserProfile).catch(resetProfile)
      } else {
        resetProfile()
      }
    } else {
      resetProfile()
    }
  }, [bitbucketService, githubService, gitlabService, netlifyService, resetProfile])

  const handleLoginClick = useCallback(async () => {
    if (!netlifyService) return

    try {
      const token = await netlifyService.getAuthToken({ provider })
      let newProfile

      switch (provider) {
        case NetlifyOAuthProvider.github:
          githubService.storage.setToken(token)
          newProfile = await githubService.getUserProfile()
          break
        case NetlifyOAuthProvider.gitlab:
          gitlabService.storage.setToken(token)
          newProfile = await gitlabService.getUserProfile()
          break
        case NetlifyOAuthProvider.bitbucket:
          bitbucketService.storage.setToken(token)
          newProfile = await bitbucketService.getUserProfile()
          break
        default:
          throw new Error(`Unknown provider ${provider}`)
      }

      await handleLogin(provider, newProfile)
      setUserProfile(newProfile)
    } catch (err) {
      resetProfile(err)
    }
  }, [
    netlifyService,
    provider,
    handleLogin,
    githubService,
    gitlabService,
    bitbucketService,
    resetProfile,
  ])

  return !userProfile ? (
    <>
      <Route exact path="/login">
        <div style={styles.container}>
          <div style={styles.radioButtons}>
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
