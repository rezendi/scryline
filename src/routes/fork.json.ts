const fetch = require('node-fetch');
const base64 = require('universal-base64');

import DB from '../components/DB';
import util from "../components/util";

export async function post(req, res, next) {
	console.log("branching repo");
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
    let data = req.body;
	try {
		let owner = process.env.GITHUB_ACCOUNT;
        let repo = process.env.GITHUB_REPO;
        
        // get master 
		let slug = util.slugize(data.title);
		let originalUser = await DB.getUserByUID(data.uid);
        let original = await DB.getLineByUserAndSlug(originalUser.id, slug);
        let originalUsername = originalUser.username ? originalUser.username : util.hash8(originalUser.email);
        
        let branch = original.metadata && original.metadata.branch ? original.metadata.branch : 'main';
        let response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`);
        let json = await response.json();
        let sha = json.object ? json.object.sha : null;
        console.log("root branch sha", sha);

        let user = req.session.sUser;
        let newBranch = `${slug}/${user.username ? user.username : util.hash8(user.email)}`;
        let newResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/vnd.github.v3+json",
                "Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
            },
            body: JSON.stringify({ ref:`refs/heads/${newBranch}`, sha:sha})
        });
        let newJson = await newResponse.json();
        
        // now save new line to DB
		await DB.saveLine(data.title, user.uid, data.line.sha, {branch:newBranch, path:originalUsername});
		res.end(JSON.stringify({success:true, url:newJson.url}));
	} catch(error) {
        console.log("error", error);
		res.end(JSON.stringify({success:false, params:{title:data.title, uid:data.uid}, error:error}));
	}
}
