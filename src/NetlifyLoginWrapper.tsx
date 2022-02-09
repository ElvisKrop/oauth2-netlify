import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { NetlifyGithubLogin } from './NetlifyGithubLogin';
import { GithubService, GithubUserProfile } from './services/github.service';

const apiId = process.env.REACT_APP_NETLIFY_API_ID

export const NetlifyLoginWrapper = ({ children }: { children: ReactNode }) => {
  const history = useHistory()
  const [userProfile, setUserProfile] = useState<null | GithubUserProfile>(null)
  const githubService = useMemo(() => new GithubService(), [])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const profile = await githubService.getUserProfile()
        setUserProfile(profile)
        history.push('/')
      } finally {
        setLoading(false)
      }
    })()
  }, [githubService, history])

  if (loading) return <h1>Wait a little bit, we are checking your profile...</h1>

  return !!userProfile || !apiId ? <>{children}</> : <NetlifyGithubLogin netlifyApiId={apiId} setUserProfile={setUserProfile} githubService={githubService} />
}
