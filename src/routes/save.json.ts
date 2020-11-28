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

		let email = data.email;
		delete data['email'] // don't save to file for privacy reasons
		if (!email) {
			throw new Error("No email");
		}

		data.slug = util.slugize(data.title);
		let yamlData = yaml.safeDump(data);

		let owner = process.env.GITHUB_ACCOUNT;
		let repo = process.env.GITHUB_REPO;
		let pathPrefix = util.hash8(req.session.slUser.email)
		let path = `lines/${pathPrefix}/${data.slug}.yaml`;

		let toPut = {
			message: "Scryline update",
			content: base64.encode(yamlData),
			committer: {
				name: "Scryline",
				email: email
			}
		};

		let originalSlug = '';
		let doRename = false;
		if (data.originalTitle) {
			originalSlug = util.slugize(data.originalTitle);
			doRename = originalSlug != data.slug;
			console.log("doRename", originalSlug);
		}

		if (!doRename) {
			if (data.sha && data.sha.length > 0) {
				toPut['sha'] = data.sha;
			}
		}

		let response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
			method: 'PUT',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/vnd.github.v3+json",
				"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
			},
			body: JSON.stringify(toPut)
		});
		let json = await response.json();
		if (json.message) {
			json.success = false;
			json.error = json.message;
			doRename = false;
		}

		if (doRename) {
			let toDelete = {
				message: "Scryline file rename",
				sha: data.sha,
			};
			let dPath = `lines/${pathPrefix}/${originalSlug}.yaml`;
			let dResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${dPath}`, {
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

		DB.saveLine(data.title, data.userid, json.content.sha, data.originalTitle);
		json.path = pathPrefix;
		console.log("saved", pathPrefix);
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
		let pathPrefix = util.hash8(req.session.slUser.email)
		let path = `lines/${pathPrefix}/${data.slug}.yaml`;
		let toDel = {
			message: "Scryline delete",
			sha: data.sha,
		};
		let response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
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
		res.end(JSON.stringify({success:false, data:data, error:error}));
	}
}

