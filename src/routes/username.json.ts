import DB from "../components/DB";

export async function get(req, res, next) {
    console.log("Checking username");
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    try {
        let check = req.query.check;
        if (check.length < 3) {
            return res.end(JSON.stringify({success:false, message:"Minimum length 3 characters"}));
        }
        let available = await DB.usernameAvailable(check);
        if (!available) {
            return res.end(JSON.stringify({success:false, message:"Not available"}));
        }
        res.end(JSON.stringify({success:true, message:"Username available!"}));
    } catch(error) {
        console.log("username error", error);
        res.end(JSON.stringify({success:false, error:error, message:error}));
    }
};

export async function post(req, res, next) {
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    try {
        let username = req.body.username;
        let row = await DB.setUsername(req.session.slUser.uid, username);
        res.end(JSON.stringify({success:true, username:row.username}));
        console.log("username", username);
    } catch(error) {
        console.log("save username error", error);
        res.end(JSON.stringify({success:false, error:error}));
    }
}
    