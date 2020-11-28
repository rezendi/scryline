import DB from "../components/DB";

export async function post(req, res, next) {
    console.log("linking GitHub user");
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    let json = req.body;
    try {
      // console.log("json", json);
      let username = json.additionalUserInfo.username;
      let token = json.credential.oauthAccessToken;
      // TODO check the token is valid
      DB.updateUserGitHubInfo(req.session.slUser.uid, username, token);
      res.end(JSON.stringify({success:true}));
    } catch(error) {
      console.log("linkUser error", error);
      res.end(JSON.stringify({success:false, error:error}));
    }
};
