import netlify from 'netlify-auth-providers';
import { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';

interface GithubOAuthResponse {
  provider: "github" | "gitlab" | "bitbucket"
  token: string
}

const authWithGitHub = async () =>
  new Promise<GithubOAuthResponse>((resolve, reject) => {
    const authenticator = new netlify({
      site_id: 'ba38890c-5f4b-4b1f-a311-2975a400303e',
    })

    authenticator.authenticate(
      {provider: 'github', scope: 'public_repo,read:org,read:user'},
      (err, data) => err ? reject(err) : resolve(data),
    )
  })

const loadGitHubUserEmails = async (token: string) =>
  await fetch("https://api.github.com/user/emails", {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${token}`,
    },
  })
    .then((response) => response.json())
    .then((response) => JSON.stringify(response));

export const NetlifyGithubLogin = () => {
  const [error, setError] = useState<null | any>(null)

  const handleLoginClick = async () => {
    try {
      const data = await authWithGitHub()
      console.log({ data })
      localStorage.setItem('GITHUB_TOKEN', data.token)

      const email = await loadGitHubUserEmails(data.token)
      console.log(email)
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
