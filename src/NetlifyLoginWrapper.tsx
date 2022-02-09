import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { NetlifyGithubLogin } from './NetlifyGithubLogin';
import { GithubService, GithubUserProfile } from './services/github.service';

const apiId = process.env.REACT_APP_NETLIFY_API_ID

export const NetlifyLoginWrapper = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<null | undefined | GithubUserProfile>(undefined)
  const githubService = useMemo(() => new GithubService(), [])
  const [, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const profile = await githubService.getUserProfile()
        setUserProfile(profile)
      } catch {
        setUserProfile(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [githubService])

  return userProfile === undefined || !apiId ? <>{children}</> : <NetlifyGithubLogin netlifyApiId={apiId} setUserProfile={setUserProfile} githubService={githubService} />
}
