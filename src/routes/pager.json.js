require('dotenv').config();
const fetch = require('node-fetch');

const metascraper = require('metascraper')([
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-image')(),
    require('metascraper-logo')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')(),
    require('metascraper-youtube')()
])

const Twitter = require('twitter');
var client = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token_key: process.env.TWITTER_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

async function parse(html, url) {
    let m = await metascraper({html, url});
    // TODO get date from URL
    // TODO get original URL from AMP links
    return {
        url: m.url || url,
        when: m.date,
        title: m.title,
        author: m.author,
        summary: m.description,
        source: m.publisher,
        originalUrl: url,
        image: m.image,
        logo: m.logo,
    };
}

// TODO some kind of caching
// TODO YouTube name

export async function get(req, res, next) {
    let url = req.headers["x-url"];
    if (url.startsWith("https://twitter.com/")) {
        console.log("fetching tweet", url);
        url = url.split("?")[0];
        let twitter_id = url.split("/").splice(-1)[0];
        console.log("id", twitter_id);
        client.get('statuses/show/' + twitter_id, {}, function(error, tweet, response) {
            if (error) {
                console.log("tweet error", error);
                res.end(JSON.stringify({url:url, source:"Twitter"}));
                return;
            }
            console.log("tweet", tweet.length);
            let metadata = {
                url: url,
                source: "Twitter",
                when: tweet.created_at,
                author: `@${tweet.user.screen_name} | ${tweet.user.id}`,
                summary: tweet.full_text || tweet.text,
                image: tweet.entities.media ? tweet.entities.media[0].media_url_https : ''
            }
            res.end(JSON.stringify(metadata));
         });
    } else {
        console.log("fetching", url);
        let response = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
        });
        let html = await response.text();
        console.log("html", html.length);
        let metadata = await parse(html, url);
        res.end(JSON.stringify(metadata));
    }
}
