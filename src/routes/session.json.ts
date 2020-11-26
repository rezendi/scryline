require('dotenv').config();

let admin = require('firebase-admin');
let app = admin.initializeApp();

export async function post(req, res, next) {
    console.log("setting session");
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    let json = req.body;
    console.log("idToken", json.token);
    try {
      let decoded = await admin.auth().verifyIdToken(json.token);
      req.session.user = { uid: decoded.uid, email: decoded.email, name: decoded.name, picture: decoded.picture };
      console.log("session now", req.session);
      res.end(JSON.stringify({success:true}));
    } catch(error) {
      console.log("error", error);
      res.end(JSON.stringify({success:false, error:error}));
    }
}
