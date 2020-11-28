import DB from "../components/DB";

require('dotenv').config();

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
      // TODO check the token works
      DB.updateUserGitHubInfo(req.session.user.uid, username, token);
      res.end(JSON.stringify({success:true}));
    } catch(error) {
      console.log("error", error);
      res.end(JSON.stringify({success:false, error:error}));
    }
};
