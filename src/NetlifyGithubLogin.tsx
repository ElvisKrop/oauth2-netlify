import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { GithubService, GithubUserProfile } from './services/github.service'
import { NetlifyService } from './services/netlify.service'

interface NetlifyLoginProps {
  netlifyApiId: string
  githubService: GithubService
  setUserProfile: Dispatch<SetStateAction<GithubUserProfile | null | undefined>>
}

export const NetlifyGithubLogin = ({
  netlifyApiId,
  githubService,
  setUserProfile,
}: NetlifyLoginProps) => {
  const [error, setError] = useState<null | unknown>(null)
  const netlifyService = useMemo(() => NetlifyService.getInstance(netlifyApiId), [netlifyApiId])

  const handleLoginClick = useCallback(async () => {
    try {
      const token = await netlifyService.auth('github')
      githubService.storage.setItem({ token })

      const newProfile = await githubService.getUserProfile()
      setUserProfile(newProfile)
      console.log({ newProfile })
    } catch (err) {
      githubService.storage.removeStoredToken()
      setUserProfile(null)
      setError(err)
    }
  }, [netlifyService, githubService, setUserProfile])

  return (
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
          {error ? (
            <div>
              Oh no! Error! <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
          ) : (
            <button onClick={handleLoginClick}>Sign In Here!</button>
          )}
        </div>
      </Route>
      <Route path="*">
        <Redirect to="/login" />
      </Route>
    </>
  )
}
