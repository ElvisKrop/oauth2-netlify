import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { GithubService, GithubUserProfile } from './services/github.service'
import { Redirect, Route } from 'react-router-dom'
import { NetlifyService } from './services/netlify.service'

export const NetlifyLoginWrapper = ({
  apiId,
  children,
}: {
  apiId?: string
  children: ReactNode | ReactNode[]
}) => {
  const netlifyService = useMemo(() => (apiId ? NetlifyService.getInstance(apiId) : null), [apiId])
  const [userProfile, setUserProfile] = useState<null | undefined | GithubUserProfile>(undefined)
  const githubService = useMemo(() => new GithubService(), [])

  const resetProfile = useCallback(
    (error?: unknown) => {
      console.error(error)
      githubService.storage.removeStoredToken()
      setUserProfile(null)
    },
    [githubService.storage],
  )

  useEffect(() => {
    if (githubService.storage.isStoredTokenValid() && apiId) {
      githubService.getUserProfile().then(setUserProfile).catch(resetProfile)
    } else {
      resetProfile()
    }
  }, [apiId, githubService, resetProfile])

  const handleLoginClick = useCallback(async () => {
    if (!netlifyService) return
    try {
      const token = await netlifyService.auth('github')
      githubService.storage.setToken(token)

      const newProfile = await githubService.getUserProfile()
      setUserProfile(newProfile)
    } catch (err) {
      resetProfile(err)
    }
  }, [netlifyService, githubService, resetProfile])

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
          }}
        >
          <button onClick={handleLoginClick}>Sign In Here!</button>
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
