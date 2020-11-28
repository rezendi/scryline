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
      let identities = Object.keys(decoded.firebase.identities);
      req.session.user = { uid: decoded.uid, email: decoded.email, name: decoded.name, picture: decoded.picture, identities:identities };
      // console.log("user", req.session.user);
      DB.saveUser(decoded.uid, decoded.email, decoded.name, decoded.picture);
      res.end(JSON.stringify({success:true}));
    } catch(error) {
      console.log("error", error);
      res.end(JSON.stringify({success:false, error:error}));
    }
};

export function del(req, res, next) {
  console.log("deleting session");
  req.session.user = { email: ''};
  res.end(JSON.stringify({success:true}));
}
