const fetch = require('node-fetch');

const metascraper = require('metascraper')([
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-image')(),
    require('metascraper-logo')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
])

async function parse(html, url) {
    let m = await metascraper({html, url});
    // TODO get date from URL
    // TODO get original URL from AMP links
    return {
        url: m.url || url,
        when: m.date || "",
        title: m.title || "",
        author: m.author || "",
        summary: m.description || "",
        source: m.publisher || "",
        originalUrl: url,
        image: m.image || "",
        logo: m.logo || "",
        chapter: "",
        tags: "",
        comments: ""
    };
}

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
    console.log("html", html.length);
    let metadata = await parse(html, url);
	res.end(JSON.stringify(metadata));
}
