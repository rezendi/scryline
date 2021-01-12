import DB from '../components/DB';
import util from "../components/util";

export async function post(req, res, next) {
	console.log("redirecting to repo");
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let params = req.query;
	try {
		let owner = process.env.GITHUB_ACCOUNT;
		let repo = process.env.GITHUB_REPO;
		let slug = util.slugize(params.title);
		let user = await DB.getUserByUID(params.uid);
		let line = await DB.getLineByUserAndSlug(user.id, slug);
		let url = `https://raw.githubusercontent.com/${owner}/${repo}/main/lines/${line.path}/${slug}.yaml`
		res.end(JSON.stringify({success:true, url:url}));
	} catch(error) {
		res.end(JSON.stringify({success:false, params:params, error:error}));
	}
}
