import { ReactNode } from 'react'
import { NetlifyOAuthProvider } from './enums'

export interface NetlifyOAuthResponse {
  provider: NetlifyOAuthProvider
  token: string
}

export interface OAuthStorageData {
  token: string
  version: string
}

export interface GitlabUserProfile {
  avatar_url: string
  bio: string
  bot: boolean
  can_create_group: boolean
  can_create_project: boolean
  color_scheme_id: number
  commit_email: string
  confirmed_at: string
  created_at: string
  current_sign_in_at: string
  email: string
  external: boolean
  followers: number
  following: number
  id: number
  identities?: {
    extern_uid: string
    provider: string
    saml_provider_id: string
  }[]
  job_title: string
  last_activity_on: string
  last_sign_in_at: string
  linkedin: string
  local_time: string
  name: string
  private_profile: boolean
  projects_limit: number
  public_email: string
  skype: string
  state: string
  theme_id: number
  twitter: string
  two_factor_enabled: boolean
  username: string
  web_url: string
  website_url: string
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

export interface BitbucketUserProfile {
  login: string
}

export type UserProfile = GithubUserProfile | GitlabUserProfile | BitbucketUserProfile

export interface NetlifyOAuthWrapperProps {
  apiId?: string
  acceptedProviders?: NetlifyOAuthProvider[]
  handleLogin?: (provider: NetlifyOAuthProvider, userProfile: UserProfile) => Promise<void>
  children: ReactNode | ReactNode[]
}
