const fetch = require('node-fetch');
const base64 = require('universal-base64');
const yaml = require('js-yaml');

export async function get(req, res, next) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	const { slug } = req.params;
	if (slug=="index") {
		return getIndex(req, res, next);
	}

	if (slug=="new") {
		res.end(JSON.stringify({success:true, line:{entries:[]}}));
		return;
	}

	let owner = process.env.GITHUB_ACCOUNT;
	let repo = process.env.GITHUB_REPO;
	let path = `${process.env.GITHUB_PATH}`;

	try {
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

async function getIndex(req, res, next) {
	try {
		let owner = process.env.GITHUB_ACCOUNT;
		let repo = process.env.GITHUB_REPO;
		let path = `${process.env.GITHUB_PATH}`;

		let response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
			method: 'GET',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/vnd.github.v3+json",
				"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
			},
		});
		let json = await response.json();
		let retval = json.map(entry => { return {
			slug: entry.name.slice(0,-5),
			sha: entry.sha
		}});
		res.end(JSON.stringify(retval));
	} catch(error) {
		res.end(JSON.stringify({success:false, slug:"index", error:error}));
	}
}