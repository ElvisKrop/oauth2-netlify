import { ReactNode } from 'react'
import { NetlifyOAuthProvider } from './enums'

export interface NetlifyOAuthResponse {
  provider: NetlifyOAuthProvider
  token: string
}

export interface GithubStorageData {
  token: string
  version: string
}

export interface GithubUserProfile {
  login: string
  id: number
  node_id: string
  avatar_url: string
  name: string
  location: string
  blog: string
  company: string
  created_at: string
  events_url: string
  followers: number
  followers_url: string
  following: number
  following_url: string
  gists_url: string
  gravatar_id: string
  html_url: string
  organizations_url: string
  public_gists: number
  public_repos: number
  received_events_url: string
  repos_url: string
  site_admin: boolean
  starred_url: string
  subscriptions_url: string
  type: string
  updated_at: string
  url: string
}

// eslint-disable-next-line
export type UserProfile = GithubUserProfile | any

export interface NetlifyOAuthWrapperProps {
  apiId?: string
  acceptedProviders?: NetlifyOAuthProvider[]
  handleLogin?: (provider: NetlifyOAuthProvider, userProfile: UserProfile) => Promise<void>
  children: ReactNode | ReactNode[]
}
