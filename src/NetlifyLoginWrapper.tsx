import React, { ReactNode, useMemo } from 'react';
import { NetlifyGithubLogin } from './NetlifyGithubLogin';

export const NetlifyLoginWrapper = ({ children }: { children: ReactNode }) => {
  const apiId = process.env.REACT_APP_NETLIFY_API_ID

  const githubToken = useMemo(() => {
    return localStorage.getItem('GITHUB_TOKEN')
  }, [])

  return githubToken || !apiId ? <>{children}</> : <NetlifyGithubLogin netlifyApiId={apiId} />
}
