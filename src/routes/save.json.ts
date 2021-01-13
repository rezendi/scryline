const yaml = require('js-yaml');
const fetch = require('node-fetch');
const base64 = require('universal-base64');

import DB from '../components/DB';
import util from "../components/util";

export async function post(req, res, next) {
	console.log("saving");
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let data = req.body;
	try {
		data.slug = util.slugize(data.title);
		let yamlData = yaml.safeDump(data, {skipInvalid:true});

		let owner = process.env.GITHUB_ACCOUNT;
		let repo = process.env.GITHUB_REPO;
		let path = util.getPathFor(req.session.sUser, data.path);
		let suffix = `lines/${path}/${data.slug}.yaml`;
		let api_url = `https://api.github.com/repos/${owner}/${repo}/contents/${suffix}`;
		console.log("put url", api_url);

		let toPut = {
			message: "Scryline update",
			content: base64.encode(yamlData),
			sha: data.sha && data.sha.length > 0 ? data.sha : null,
			branch: 'main'
		};

		let doRename = false;
		let originalSlug = '';
		if (data.branch) {
			console.log("branch", data.branch);
			toPut.branch = data.branch;
			// don't let people rename in a branch, too confusing
			data.title = data.originalTitle ? data.originalTitle : data.title;
		}

		if (data.originalTitle) {
			originalSlug = util.slugize(data.originalTitle);
			doRename = originalSlug != data.slug;
		}
		if (doRename) {
			console.log("doRename", originalSlug);
			delete toPut["sha"];
		}

		// console.log("posting to GH", toPut);
		let response = await fetch(api_url, {
			method: 'PUT',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/vnd.github.v3+json",
				"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
			},
			body: JSON.stringify(toPut)
		});
		let json = await response.json();
		if (json.message && json.message.length > 0) {
			// console.log("gh json", json);
			json.success = false;
			json.error = "GH: " + json.message;
			doRename = false;
		}

		if (doRename) {
			let toDelete = {
				message: "Scryline file rename",
				sha: data.sha,
				branch: toPut.branch
			};
			let dSuffix = `lines/${path}/${originalSlug}.yaml`;
			let dResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${dSuffix}`, {
				method: 'DELETE',
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/vnd.github.v3+json",
					"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
				},
				body: JSON.stringify(toDelete)
			});
			let dJSON = await dResponse.json();
		}

		let metadata = {originalTitle:`${data.originalTitle}`};
		await DB.saveLine(data.title, data.userid, json.content.sha, metadata);
		json.path = path;
		console.log("saved", suffix);
		res.end(JSON.stringify(json));
	} catch(error) {
		res.end(JSON.stringify({success:false, data:data, error:error}));
	}
}

export async function del(req, res, next) {
	console.log("deleting");
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let data = req.body;
	try {
		let owner = process.env.GITHUB_ACCOUNT;
		let repo = process.env.GITHUB_REPO;
		data.slug = util.slugize(data.title);
		let path = util.getPathFor(req.session.sUser, data.path);
		let suffix = `lines/${path}/${data.slug}.yaml`;
		let toDel = {
			message: "Scryline delete",
			sha: data.sha,
			branch: data.branch ? data.branch : "main"
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
		DB.deleteLine(data.title, data.userid);
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
		let user = await DB.getUserByUID(params.uid);
		let line = await DB.getLineByUserAndSlug(user.id, slug);
		let url = `https://raw.githubusercontent.com/${owner}/${repo}/main/lines/${line.path}/${slug}.yaml`
		res.end(JSON.stringify({success:true, url:url}));
	} catch(error) {
		res.end(JSON.stringify({success:false, params:params, error:error}));
	}
}

