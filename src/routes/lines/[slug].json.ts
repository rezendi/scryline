const yaml = require('js-yaml');
const fetch = require('node-fetch');
const base64 = require('universal-base64');
const sha256 = require('sha256');

export async function get(req, res, next) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});

	const { slug } = req.params;
	if (slug=="index" || slug=="all") {
		return getIndex(req, res, next);
	}
	if (slug=="new") {
		res.end(JSON.stringify({success:true, line:{entries:[]}}));
		return;
	}

	try {
		let owner = process.env.GITHUB_ACCOUNT;
		let repo = process.env.GITHUB_REPO;
		let email = req.session.user ? req.session.user.email || '' : '';
		let path = `lines/${sha256(email).substring(0,8)}`;

		let response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}/${slug}.yaml`, {
			method: 'GET',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/vnd.github.v3+json",
				"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
			},
		});
		let json = await response.json();
		let converted = base64.decode(json.content);
		let retval = yaml.safeLoad(converted);
		retval.sha = json.sha;
		res.end(JSON.stringify({success:true, line:retval}));
	} catch(error) {
		res.end(JSON.stringify({success:false, slug:slug, error:error}));
	}
}

import db from '../../components/DB';

async function getIndex(req, res, next) {
	try {
		let rows = await db.getLines();
		console.log("rows", rows);
		let lines = rows.map(row => { return {
			uid: row.uid,
			title: row.title,
			path: row.path,
			slug: row.slug,
			sha: row.sha
		}});
		res.end(JSON.stringify({success:true, lines:lines}));
	} catch(error) {
		res.end(JSON.stringify({success:false, slug:"index", error:error, lines:[]}));
	}
}
