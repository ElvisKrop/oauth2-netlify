import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router';
import { Redirect, Route } from 'react-router-dom'
import { GithubService, GithubUserProfile } from './services/github.service'
import { NetlifyService } from './services/netlify.service'

export const NetlifyGithubLogin = ({ netlifyApiId, githubService, setUserProfile }: { netlifyApiId: string, githubService: GithubService, setUserProfile:  Dispatch<SetStateAction<GithubUserProfile | null | undefined>> }) => {
  const history = useHistory()
  const [error, setError] = useState<null | any>(null)
  const netlifyService = useMemo(() => NetlifyService.getInstance(netlifyApiId), [netlifyApiId])

  const handleLoginClick = useCallback(async () => {
    try {
      const token = await netlifyService.auth('github')
      githubService.storage.setItem({ token })

      const profile = await githubService.getUserProfile()
      setUserProfile(profile)
      console.log(profile)
      history.push('/home')
    } catch (error) {
      setUserProfile(null)
      console.log('Oh no', error)
      setError({ error })
    }
  }, [netlifyService, githubService, setUserProfile, history])

  return (
      <>
        <Route exact path="/login">
          <div style={{ minHeight: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
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
