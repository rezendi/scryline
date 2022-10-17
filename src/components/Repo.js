"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
require('dotenv').config();
var yaml = require('js-yaml');
var base64 = require('universal-base64');
var util_1 = require("../components/util");
function saveLine(data, path) {
    return __awaiter(this, void 0, void 0, function () {
        var yamlData, owner, repo, suffix, api_url, toPut, doRename, originalSlug, response, json, toDelete, dSuffix, dResponse, dJSON, metadata;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data.slug = util_1["default"].slugize(data.title);
                    yamlData = yaml.safeDump(data, { skipInvalid: true });
                    owner = process.env.GITHUB_ACCOUNT;
                    repo = process.env.GITHUB_REPO;
                    suffix = "lines/".concat(path, "/").concat(data.slug, ".yaml");
                    api_url = "https://api.github.com/repos/".concat(owner, "/").concat(repo, "/contents/").concat(suffix);
                    console.log("put url", api_url);
                    toPut = {
                        message: "Scryline update",
                        content: base64.encode(yamlData),
                        sha: data.sha && data.sha.length > 0 ? data.sha : null,
                        branch: 'main'
                    };
                    doRename = false;
                    originalSlug = '';
                    if (data.branch) {
                        console.log("branch", data.branch);
                        toPut.branch = data.branch;
                        // don't let people rename in a branch, too confusing
                        data.title = data.originalTitle ? data.originalTitle : data.title;
                    }
                    if (data.originalTitle) {
                        originalSlug = util_1["default"].slugize(data.originalTitle);
                        doRename = originalSlug != data.slug;
                    }
                    if (doRename) {
                        console.log("doRename", originalSlug);
                        delete toPut["sha"];
                    }
                    return [4 /*yield*/, fetch(api_url, {
                            method: 'PUT',
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/vnd.github.v3+json",
                                "Authorization": "Basic ".concat(base64.encode("".concat(owner, ":").concat(process.env.GITHUB_TOKEN)))
                            },
                            body: JSON.stringify(toPut)
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    json = _a.sent();
                    if (json.message && json.message.length > 0) {
                        // console.log("gh json", json);
                        json.success = false;
                        json.error = "GH: " + json.message;
                        doRename = false;
                    }
                    if (!doRename) return [3 /*break*/, 5];
                    toDelete = {
                        message: "Scryline file rename",
                        sha: data.sha,
                        branch: toPut.branch
                    };
                    dSuffix = "lines/".concat(path, "/").concat(originalSlug, ".yaml");
                    return [4 /*yield*/, fetch("https://api.github.com/repos/".concat(owner, "/").concat(repo, "/contents/").concat(dSuffix), {
                            method: 'DELETE',
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/vnd.github.v3+json",
                                "Authorization": "Basic ".concat(base64.encode("".concat(owner, ":").concat(process.env.GITHUB_TOKEN)))
                            },
                            body: JSON.stringify(toDelete)
                        })];
                case 3:
                    dResponse = _a.sent();
                    return [4 /*yield*/, dResponse.json()];
                case 4:
                    dJSON = _a.sent();
                    _a.label = 5;
                case 5:
                    metadata = { originalTitle: data.originalTitle, branch: data.branch };
                    return [2 /*return*/, { json: json, metadata: metadata, suffix: suffix }];
            }
        });
    });
}
exports["default"] = {
    saveLine: saveLine
};
