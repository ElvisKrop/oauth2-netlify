import netlify from 'netlify-auth-providers';
import { useMemo, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';

interface GithubOAuthResponse {
  provider: "github" | "gitlab" | "bitbucket"
  token: string
}

const authWithGitHub = async (netlifyApiId: string) =>
  new Promise<GithubOAuthResponse>((resolve, reject) => {
    const authenticator = new netlify({
      site_id: netlifyApiId,
    })

    authenticator.authenticate(
      { provider: 'github', scope: 'read:user' },
      (err, data) => err ? reject(err) : resolve(data),
    )
  })

const loadGitHubUser = async (token: string) =>
  await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${token}`,
    },
  })
    .then((response) => response.json());
    // .then((response) => JSON.stringify(response));

export const NetlifyGithubLogin = ({ netlifyApiId }: { netlifyApiId: string }) => {
  const [error, setError] = useState<null | any>(null)
  const ENV = useMemo(() => process.env, [])

  const handleLoginClick = async () => {
    try {

      const data = await authWithGitHub(netlifyApiId)
      console.log({ data })
      localStorage.setItem('GITHUB_TOKEN', data.token)

      const userProfile = await loadGitHubUser(data.token)
      console.log(userProfile)
      console.log({ ENV })
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
        <Route render={() => <Redirect to="/login" />} />
      </>
    )
}
