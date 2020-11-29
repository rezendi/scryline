import DB from "../components/DB";

export async function post(req, res, next) {
    console.log("linking user");
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    let json = req.body;
    try {
      if (json.site=="github.com") {
        // TODO check the token is valid
        let username = json.result.additionalUserInfo.username;
        let token = json.result.credential.oauthAccessToken;
        let uid = req.session.slUser.uid || json.result.user.uid
        console.log("GH uid", uid);
        await DB.saveUserGitHubInfo(uid, username, token);
        res.end(JSON.stringify({success:true}));
      }
    } catch(error) {
      console.log("linkUser error", error);
      res.end(JSON.stringify({success:false, error:error, input:json}));
    }
};

export async function del(req, res, next) {
  console.log("Unlinking user");
  res.writeHead(200, {
    'Content-Type': 'application/json'
  });
  let json = req.body;
  try {
    // console.log("json", json);
    if (json.site=="github.com") {
      await DB.saveUserGitHubInfo(req.session.slUser.uid, '', '');
    }
    let idsIdx = req.session.slUser.identities.indexOf(json.site);
    if (idsIdx >= 0) {
      req.session.slUser.identities.splice(idsIdx, 1);
    }
    res.end(JSON.stringify({success:true}));
  } catch(error) {
    console.log("unlinkUser error", error);
    res.end(JSON.stringify({success:false, error:error, input:json}));
  }
};
