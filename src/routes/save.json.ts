const fetch = require('node-fetch');
const base64 = require('universal-base64');
const yaml = require('js-yaml');
const slugify = require('slugify');

export async function post(req, res, next) {
	console.log("saving");
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let data = req.body;
	try {
		let title = data.title;
		let slug = slugify(title, {lower: true, strict: true, locale: 'en'});
		data.slug = slug;
		let yamlData = yaml.safeDump(data);
		// console.log("yaml", yamlData);

		let owner = process.env.GITHUB_ACCOUNT;
		let repo = process.env.GITHUB_REPO;
		let path = `${process.env.GITHUB_PATH}/${slug}.yaml`;

		let toPut = {
			message: "Scryline update",
			content: base64.encode(yamlData),
			committer: {
				name: process.env.GITHUB_AUTHOR_NAME,
				email: process.env.GITHUB_AUTHOR_EMAIL
			}
		};

		let originalSlug = '';
		let doRename = false;
		if (data.originalTitle) {
			originalSlug = slugify(data.originalTitle, {lower: true, strict: true, locale: 'en'});
			doRename = originalSlug != slug;
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
				sha:data.sha,
				committer: {
					name: process.env.GITHUB_AUTHOR_NAME,
					email: process.env.GITHUB_AUTHOR_EMAIL
				}
			};
			let dPath = `${process.env.GITHUB_PATH}/${originalSlug}.yaml`;
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

		res.end(JSON.stringify(json));
	} catch(error) {
		res.end(JSON.stringify({success:false, data:data, error:error}));
	}
}
