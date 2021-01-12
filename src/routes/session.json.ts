import firebase from "firebase";
import DB from "../components/DB";

require('dotenv').config();

let admin = require('firebase-admin');
let app = admin.initializeApp();

export async function post(req, res, next) {
    console.log("setting session");
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    let json = req.body;
    try {
      let decoded = await admin.auth().verifyIdToken(json.token);
      // console.log("decoded", decoded);
      let identities = Object.keys(decoded.firebase.identities);
      // TODO don't do this every time
      let dbVals = await DB.saveUser(decoded.uid, decoded.email, decoded.name, decoded.picture);
      req.session.sUser = {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        identities: identities,
        username: dbVals.username,
        github: dbVals.github && dbVals.github.startsWith("{") ? JSON.parse(dbVals.github).username : ''
      };
      res.end(JSON.stringify({success:true, sUser:req.session.sUser}));
    } catch(error) {
      console.log("error", error);
      res.end(JSON.stringify({success:false, error:error}));
    }
};

export function del(req, res, next) {
  console.log("deleting session");
  req.session.sUser = { email: ''};
  res.end(JSON.stringify({success:true}));
}
