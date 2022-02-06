import netlify from 'netlify-auth-providers';
import { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { GraphQLClient } from 'graphql-request'

interface GithubOAuthResponse {
  provider: "github" | "gitlab" | "bitbucket"
  token: string
}

async function authWithGitHub() {
  return new Promise<GithubOAuthResponse>((resolve, reject) => {
    const authenticator = new netlify({
      site_id: 'ba38890c-5f4b-4b1f-a311-2975a400303e',
    })

    authenticator.authenticate(
      {provider: 'github', scope: 'public_repo,read:org,read:user'},
      (err, data) => err ? reject(err) : resolve(data),
    )
  })
}

function getClient(token: string): GraphQLClient {
  const headers = { Authorization: `bearer ${token}` }
  return new GraphQLClient('https://api.github.com/graphql', { headers })
}

async function loadGitHubUserEmails(token: string) {
  return await fetch("https://api.github.com/user/emails", {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${token}`,
    },
  })
    .then((response) => response.json())
    .then((response) => JSON.stringify(response));
}

export const NetlifyGithubLogin = () => {
  const [error, setError] = useState<null | any>(null)
  const [client, setClient] = useState<null | GraphQLClient>(null)

  useEffect(() => {
    if (!client) {
      const currentGithubToken = localStorage.getItem('GITHUB_TOKEN')
      if (currentGithubToken) {
        const newClient = getClient(currentGithubToken)
        setClient(newClient)
      }
    }
  }, [client])

  const handleLoginClick = async () => {
    try {
      const data = await authWithGitHub()
      console.log({ data })
      localStorage.setItem('GITHUB_TOKEN', data.token)

      const email = await loadGitHubUserEmails(data.token)
      console.log(email)
      const newClient = getClient(data.token)
      console.log(newClient)

      setClient(newClient)
    } catch (error) {
      console.log('Oh no', error)
      setError({ error })
    }
  }

  // if (client) return <Redirect to="/" />
  // else if (error) return (
  if (error) return (
    <div>
      Oh no! Error! <pre>{JSON.stringify(error, null, 2)}</pre>
    </div>
  )
  else return (
      <>
        <Route path="/login" render={() => (
          <div>
            You have no client!
            <button onClick={handleLoginClick}>Sign In Here!</button>
          </div>
        )} />
        <Route path="*" render={() => <Redirect to="/login" />} />
      </>
    )
}
