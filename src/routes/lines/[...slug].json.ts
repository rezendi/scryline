const yaml = require('js-yaml');
const fetch = require('node-fetch');
const base64 = require('universal-base64');
import util from "../../components/util";

export async function get(req, res, next) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});

	// TODO: determine whether we need to use the current user's account/repo
	let owner = process.env.GITHUB_ACCOUNT;
	let repo = process.env.GITHUB_REPO;
	let user = req.session.sUser;
	let username = user.username ? user.username : util.hash8(user.email);

	//console.log("params", req.params);
	let [path, slug] = req.params.slug;
	if (path=="all" || path=="index") {
		return getIndex(slug, req, res, next);
	}

	if (req.params.slug.length > 2) {
		let params = req.params.slug;
		owner = params.shift();
		repo = params.shift();
		slug = params.pop();
		params.unshift("contents");
		path = params.join("/");
	} else {
		path = "contents/lines/" + path;
	}

	let api_url = `https://api.github.com/repos/${owner}/${repo}/${path}/${slug}.yaml`;
	if (req.query.b) { // if this is a forked line
		api_url += `?ref=${slug}%2F${username}`; // our standard for branch names
	}
	console.log("get url", api_url);

	try {
		let email = req.session.sUser ? req.session.sUser.email || '' : '';
		let response = await fetch(api_url, {
			method: 'GET',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/vnd.github.v3+json",
				"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
			},
		});
		let json = await response.json();
		// console.log("json", json);
		let converted = base64.decode(json.content);
		let retval = yaml.safeLoad(converted);
		retval.sha = json.sha;
		retval.path = json.path.substring(json.path.indexOf("/")+1,json.path.lastIndexOf("/"));
		retval.userid = req.query.b ? user.uid : retval.userid;
		res.end(JSON.stringify({success:true, line:retval}));
	} catch(error) {
		res.end(JSON.stringify({success:false, slug:slug, error:error}));
	}
}

import DB from '../../components/DB.js';

async function getIndex(slug, req, res, next) {
	try {
		let uid = slug=="my" ? req.session.sUser.uid : null;
		let rows = await DB.getLines(uid);
		let lines = rows.map(row => { return {
			uid: row.user_id,
			title: row.title,
			path: row.path,
			slug: row.slug,
			sha: row.sha,
			branch: row.metadata ? row.metadata.branch : null
		}});
		res.end(JSON.stringify({success:true, lines:lines}));
	} catch(error) {
		res.end(JSON.stringify({success:false, slug:"index", error:error, lines:[]}));
	}
}

