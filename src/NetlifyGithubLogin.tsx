import netlify from 'netlify-auth-providers';
import { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { GraphQLClient } from 'graphql-request'

async function authWithGitHub() {
  return new Promise((resolve, reject) => {
    const authenticator = new netlify({
      site_id: 'ba38890c-5f4b-4b1f-a311-2975a400303e',
    })
    authenticator.authenticate(
      {provider: 'github', scope: 'public_repo,read:org,read:user'},
      function(err, data) {
        if (err) {
          reject(err)
        }
        resolve(data)
      },
    )
  })
}

function getClient(token: string) {
  const headers = {Authorization: `bearer ${token}`}
  return new GraphQLClient('https://api.github.com/graphql', {headers})
}

export const NetlifyGithubLogin = () => {
  const [error, setError] = useState<null | any>(null)
  const [client, setClient] = useState(null)

  const handleLoginClick = async () => {
    const data = await authWithGitHub().catch(error => {
      console.log('Oh no', error)
      setError({ error })
    })
    console.log({ data })
    // @ts-ignore
    localStorage.setItem('GITHUB_TOKEN', data.token)
    // @ts-ignore
    setClient(getClient(data.token))
  }

  if (client) return <Redirect to="/" />
  else if (error) return (
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
  // return <>
  //   client ? (
  //   <Redirect to="/" />
  //   ) : error ? (
  //   <div>
  //     Oh no! Error! <pre>{JSON.stringify(error, null, 2)}</pre>
  //   </div>
  //   ) : (
  //   <>
  //     <Route path="/login" render={() => (
  //       <div>
  //         You have no client!
  //         <button onClick={handleLoginClick}>Sign In Here!</button>
  //       </div>
  //     )} />
  //     <Route path="*" render={() => <Redirect to="/login" />} />
  //   </>
  //   )
  // </>
}
