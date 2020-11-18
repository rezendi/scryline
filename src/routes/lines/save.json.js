const fetch = require('node-fetch');
const base64 = require('base-64');
const yaml = require('js-yaml');

export async function post(req, res, next) {
	console.log("saving to", process.env.GITHUB_PATH);
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let data = req.body;
	let yamlData = yaml.safeDump(data);
	console.log("yaml", yamlData);

	let owner = process.env.GITHUB_ACCOUNT;
	let repo = process.env.GITHUB_REPO;
	let path = process.env.GITHUB_PATH;

	let toPut = {
		message: "Scryline update",
		content: base64.encode(yamlData),
		/*
		committer: {
			author: {
				name: process.env.GITHUB_AUTHOR_NAME,
				email: process.env.GITHUB_AUTHOR_EMAIL
			}
		}
		*/
	};

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
	res.end(JSON.stringify( {success: true, response: json} ));
}
