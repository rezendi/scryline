require('dotenv').config();
const yaml = require('js-yaml');
const base64 = require('universal-base64');
import util from "../components/util";

async function saveLine(data, path) {
    data.slug = util.slugize(data.title);
    let yamlData = yaml.safeDump(data, {skipInvalid:true});

    let owner = process.env.GITHUB_ACCOUNT;
    let repo = process.env.GITHUB_REPO;
    let suffix = `lines/${path}/${data.slug}.yaml`;
    let api_url = `https://api.github.com/repos/${owner}/${repo}/contents/${suffix}`;
    console.log("put url", api_url);

    let toPut = {
        message: "Scryline update",
        content: base64.encode(yamlData),
        sha: data.sha && data.sha.length > 0 ? data.sha : null,
        branch: 'main'
    };

    let doRename = false;
    let originalSlug = '';
    if (data.branch) {
        console.log("branch", data.branch);
        toPut.branch = data.branch;
        // don't let people rename in a branch, too confusing
        data.title = data.originalTitle ? data.originalTitle : data.title;
    }

    if (data.originalTitle ) {
        originalSlug = util.slugize(data.originalTitle);
        doRename = originalSlug != data.slug;
    }
    if (doRename) {
        console.log("doRename", originalSlug);
        delete toPut["sha"];
    }

    // console.log("posting to GH", toPut);
    let response = await fetch(api_url, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json",
            "Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
        },
        body: JSON.stringify(toPut)
    });
    let json = await response.json();
    if (json.message && json.message.length > 0) {
        // console.log("gh json", json);
        json.success = false;
        json.error = "GH: " + json.message;
        doRename = false;
    }

    if (doRename) {
        let toDelete = {
            message: "Scryline file rename",
            sha: data.sha,
            branch: toPut.branch
        };
        let dSuffix = `lines/${path}/${originalSlug}.yaml`;
        let dResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${dSuffix}`, {
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

    let metadata = {originalTitle:data.originalTitle, branch:data.branch};
    return {json:json, metadata:metadata, suffix:suffix};
}

export default {
    saveLine
}
