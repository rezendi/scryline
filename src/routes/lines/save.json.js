let base64 = require('base-64');

export async function post(req, res, next) {
	console.log("saving to", process.env.GITHUB_PATH);
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let owner = process.env.GITHUB_ACCOUNT;
	let repo = process.env.GITHUB_PATH;
	res.end(JSON.stringify({success: true}));

	return;
    let response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
			"Content-Type": "application/json",
			"Accept": "application/vnd.github.v3+json",
			"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
		},
        body: JSON.stringify(line)
	});
	let json = await response.json();
	res.end(JSON.stringify( {success: true, response: json} ));
}
