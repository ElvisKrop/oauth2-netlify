import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { GithubService, GithubUserProfile } from './services/github.service'
import { NetlifyService } from './services/netlify.service'

export const NetlifyGithubLogin = ({ netlifyApiId, githubService, setUserProfile }: { netlifyApiId: string, githubService: GithubService, setUserProfile:  Dispatch<SetStateAction<GithubUserProfile | null>> }) => {
  const [error, setError] = useState<null | any>(null)
  const netlifyService = useMemo(() => NetlifyService.getInstance(netlifyApiId), [netlifyApiId])

  const handleLoginClick = async () => {
    try {
      const token = await netlifyService.auth('github')
      githubService.storage.setItem({ token })

      const profile = await githubService.getUserProfile()
      setUserProfile(profile)
      console.log(profile)
    } catch (error) {
      console.log('Oh no', error)
      setError({ error })
    }
  }

  if (error) return (
    <div>
      Oh no! Error! <pre>{JSON.stringify(error, null, 2)}</pre>
    </div>
  )
  else return (
      <>
        <Route exact path="/login">
          <div style={{ minHeight: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <button onClick={handleLoginClick}>Sign In Here!</button>
          </div>
        </Route>
        <Route path="*">
          <Redirect to="/login" />
        </Route>
      </>
    )
}
