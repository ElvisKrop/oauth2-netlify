import React, { ReactNode, useMemo } from 'react';
import { NetlifyGithubLogin } from './NetlifyGithubLogin';

export const NetlifyLoginWrapper = ({ children }: { children: ReactNode }) => {
  const githubToken = useMemo(() => {
    return localStorage.getItem('GITHUB_TOKEN')
  }, [])

  return githubToken ? <>{children}</> : <NetlifyGithubLogin />
}
