import React from 'react';
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'
import './App.css';
import { NetlifyLoginWrapper } from './NetlifyLoginWrapper';

// async function loadGitHubUserEmails(token: string) {
//   return await fetch("https://api.github.com/user/emails", {
//     headers: {
//       Accept: "application/vnd.github.v3+json",
//       Authorization: `token ${token}`,
//     },
//   })
//     .then((response) => response.json())
//     .then((response) => JSON.stringify(response));
// }

function App() {
  // const authenticator = useMemo(
  //   () => new netlify({
  //     site_id: 'ba38890c-5f4b-4b1f-a311-2975a400303e',
  //     base_url: 'https://oauth-github.netlify.app/',
  //   }),
  //   [],
  // );

  // const auth = useCallback(() => {
  //   return authenticator.authenticate({ provider: "github", scope: "user" }, (error,  data) => {
  //     if (error) {
  //       console.log(error)
  //     }
  //     console.log(data)
  //   })
  // }, [])

//   authenticator.authenticate(
//     // Set the OAuth provider and token scope
//     // Provider can be "github", "gitlab", or "bitbucket"
//     // The scopes available depend on your OAuth provider
//     { provider: "github", scope: "user" },
//     async (error, data) => {
//       if (error) {
//         outputToken.innerText =
//           "Error Authenticating with GitHub: " + error;
//       } else {
//         outputToken.innerText =
//           "Authenticated with GitHub. Access Token: " +
//           data.token;
//         outputEmail.innerText = await loadGitHubUserEmails(
//           data.token
//         );
//       }
//     }
//   );
// })

  return (
    <div className="App">
      <Router>
        <NetlifyLoginWrapper>
          <Route exact path="/home" render={() => <h1>Root Page</h1>} />
          <Route exact path="/secondary" render={() => <h1>Secondary Page</h1>}/>
          <Route path="*" render={() => <Redirect to="/home" />} />
        </NetlifyLoginWrapper>
      </Router>
    </div>
  )
}

export default App;
