const fetch = require('node-fetch');

export async function get(req, res, next) {
    let url = req.headers["x-url"];
    console.log("fetching", url);
	let response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
        redirect: 'follow',
    });
    let html = await response.text();
    // console.log("got", html);

    let retval = { 
        url: url,
        chapter: "",
        tags: "",
        title: "",
    };
	res.end(JSON.stringify(retval));
}
