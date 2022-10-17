const fetch = require('node-fetch');
const base64 = require('universal-base64');

import DB from '../components/DB';
import Repo from '../components/Repo';
import util from "../components/util";

export async function post(req, res, next) {
	console.log("saving");
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let data = req.body;
	try {
		let path = util.getPathFor(req.session.sUser, data.path);
		let repo = await Repo.saveLine(data, path);
		let dbVals = await DB.saveLine(data.title, req.session.sUser.uid, repo.json.content.sha, repo.metadata);
		repo.json.path = dbVals.path;
		console.log("saved", repo.suffix);
		res.end(JSON.stringify(repo.json));
	} catch(error) {
		res.end(JSON.stringify({success:false, data:data, error:error}));
	}
}

// TODO move this to Repo too
export async function del(req, res, next) {
	console.log("deleting");
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let data = req.body;
	try {
		let owner = process.env.GITHUB_ACCOUNT;
		let repo = process.env.GITHUB_REPO;

		if (data.branch) {
			// we branch per-file, so just delete the whole branch
			let api_url = `https://api.github.com/repos/${owner}/${repo}/git/refs/${data.branch}`;
			console.log("api_url", api_url);
			let response = await fetch(api_url, {
				method: 'DELETE',
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/vnd.github.v3+json",
					"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
				},
			});
			let json = await response.json();
			console.log("response", json);
			if (response.status==204) {
				console.log("branch deleted", data.branch);
				DB.deleteLine(data.title, data.userid);
				return res.end(JSON.stringify({json, ...{ success: true}}));
			} else {
				return res.end(JSON.stringify({json, ...{ success: false}}));
			}
		}

		data.slug = util.slugize(data.title);
		let path = util.getPathFor(req.session.sUser, data.path);
		let suffix = `lines/${path}/${data.slug}.yaml`;
		let toDel = {
			message: "Scryline delete",
			sha: data.sha,
			branch: "main"
		};
		let response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${suffix}`, {
			method: 'DELETE',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/vnd.github.v3+json",
				"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
			},
			body: JSON.stringify(toDel)
		});
		let json = await response.json();
		DB.deleteLine(data.title, req.session.sUser.uid);
		console.log("deleted");
		res.end(JSON.stringify({json, ...{ success: true}}));
	} catch(error) {
		console.log("save error", error);
		res.end(JSON.stringify({success:false, data:data, error:error}));
	}
}

export async function get(req, res, next) {
	console.log("redirecting to repo");
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let params = req.query;
	try {
		let owner = process.env.GITHUB_ACCOUNT;
		let repo = process.env.GITHUB_REPO;
		let slug = util.slugize(params.title);
		let line = await DB.getLineByUIDAndSlug(params.uid, slug);
		let url = `https://raw.githubusercontent.com/${owner}/${repo}/main/lines/${line.path}/${slug}.yaml`
		console.log("b", params.b);
		if (params.b) {
			url = url.replace("main", `${params.b}`);
		}
		console.log("url", url);
		res.end(JSON.stringify({success:true, url:url}));
	} catch(error) {
		res.end(JSON.stringify({success:false, params:params, error:error}));
	}
}

