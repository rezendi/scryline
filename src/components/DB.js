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
var fs = require('fs');
var util_1 = require("../components/util");
var options = {};
var pgp = require('pg-promise')(options);
var defaultPostgresUrl = "postgres://postgres:".concat(process.env.POSTGRES_PASSWORD, "@localhost:5432/postgres");
var connectionString = process.env.DATABASE_URL || defaultPostgresUrl;
var certPath = '/app/config/do-pg-client.crt';
var certPathExists = fs.existsSync(certPath);
var connectionOptions = certPathExists ? { connectionString: connectionString, ssl: { cert: fs.readFileSync(certPath) } } : connectionString;
var db = pgp(connectionOptions);
function doCreate() {
    return __awaiter(this, void 0, void 0, function () {
        var exists_query, exists_results, users_query, lines_query, indexes_qqery, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    exists_query = "SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lines'";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, db.any(exists_query)];
                case 2:
                    exists_results = _a.sent();
                    if (!(exists_results.length == 0)) return [3 /*break*/, 6];
                    console.log("Creating DB");
                    users_query = "CREATE TABLE IF NOT EXISTS Users (id serial PRIMARY KEY, status INTEGER DEFAULT 0, uid VARCHAR(255)";
                    users_query += ", email VARCHAR(255), name VARCHAR(255), username VARCHAR(255), twitter VARCHAR(255)";
                    users_query += ", github VARCHAR(255), metadata JSONB, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)";
                    return [4 /*yield*/, db.none(users_query)];
                case 3:
                    _a.sent();
                    lines_query = "CREATE TABLE IF NOT EXISTS Lines (id serial PRIMARY KEY, user_id INTEGER, status INTEGER DEFAULT 0";
                    lines_query += ", slug VARCHAR(255), title VARCHAR(255), path VARCHAR(255), sha VARCHAR(255), metadata JSONB";
                    lines_query += ", created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES Users (id))";
                    return [4 /*yield*/, db.none(lines_query)];
                case 4:
                    _a.sent();
                    indexes_qqery = "CREATE UNIQUE INDEX uid_index ON Users (uid); ";
                    indexes_qqery += "CREATE INDEX userid_index ON Lines (user_id); ";
                    indexes_qqery += "CREATE INDEX created_at_index ON Lines (created_at); ";
                    indexes_qqery += "CREATE UNIQUE INDEX user_slug_index ON Lines (user_id, slug); ";
                    return [4 /*yield*/, db.none(indexes_qqery)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.log("create DB error", error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function doUpdate() {
    return __awaiter(this, void 0, void 0, function () {
        var update_query, update_results, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    update_query = "";
                    if (!update_query) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log("updating DB");
                    return [4 /*yield*/, db.any(update_query)];
                case 2:
                    update_results = _a.sent();
                    console.log("results", update_results);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.log("update DB error", error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
doCreate();
doUpdate();
/* Lines */
function getLines(uid, offset) {
    if (uid === void 0) { uid = null; }
    if (offset === void 0) { offset = 20; }
    return __awaiter(this, void 0, void 0, function () {
        var query, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = "SELECT * FROM LINES ORDER BY created_at DESC LIMIT ".concat(offset);
                    if (!uid) return [3 /*break*/, 3];
                    return [4 /*yield*/, db.oneOrNone("SELECT * FROM Users WHERE uid=$1", uid)];
                case 1:
                    user = _a.sent();
                    query = "SELECT * FROM LINES WHERE user_id = $1 ORDER BY created_at DESC ";
                    return [4 /*yield*/, db.any(query, [user.id])];
                case 2: return [2 /*return*/, _a.sent()];
                case 3: return [4 /*yield*/, db.any(query)];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function saveLine(title, userid, sha, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var user, path, rename, originalSlug, slug, existing, query, query, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, db.oneOrNone("SELECT * FROM Users WHERE uid=$1", userid)];
                case 1:
                    user = _a.sent();
                    path = user.username ? user.username : util_1["default"].hash8(user.email);
                    path = metadata.branch ? metadata.branch.split("/")[0] : path;
                    rename = metadata.originalTitle && metadata.originalTitle != title;
                    originalSlug = rename ? util_1["default"].slugize(metadata.originalTitle) : util_1["default"].slugize(title);
                    slug = util_1["default"].slugize(title);
                    return [4 /*yield*/, db.oneOrNone("SELECT * FROM Lines WHERE user_id=$1 AND slug=$2", [user.id, originalSlug])];
                case 2:
                    existing = _a.sent();
                    if (!existing) return [3 /*break*/, 4];
                    query = "UPDATE Lines SET slug = $1, title = $2, path = $3, sha = $4, metadata = $5 WHERE user_id = $6 AND slug = $7 RETURNING *";
                    return [4 /*yield*/, db.one(query, [slug, title, path, sha, metadata, user.id, originalSlug])];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    query = "INSERT INTO Lines (user_id, slug, title, path, sha, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
                    return [4 /*yield*/, db.one(query, [user.id, slug, title, path, sha, metadata])];
                case 5: return [2 /*return*/, _a.sent()];
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_3 = _a.sent();
                    console.log("DB error saving line", error_3);
                    throw (error_3);
                case 8: return [2 /*return*/];
            }
        });
    });
}
function deleteLine(title, userid) {
    return __awaiter(this, void 0, void 0, function () {
        var slug, user, query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    slug = util_1["default"].slugize(title);
                    return [4 /*yield*/, db.oneOrNone("SELECT * FROM Users WHERE uid=$1", userid)];
                case 1:
                    user = _a.sent();
                    query = "DELETE FROM LINES WHERE slug = $1 AND user_id = $2";
                    return [4 /*yield*/, db.any(query, [slug, user.id])];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getLineByUIDAndSlug(userid, slug) {
    return __awaiter(this, void 0, void 0, function () {
        var user, query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.oneOrNone("SELECT id FROM Users WHERE uid=$1", userid)];
                case 1:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, null];
                    }
                    query = "SELECT * FROM Lines WHERE user_id = $1 AND slug = $2";
                    return [4 /*yield*/, db.oneOrNone(query, [user.id, slug])];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/* Users */
function saveUser(uid, email, name, image) {
    return __awaiter(this, void 0, void 0, function () {
        var existing, query, query, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, db.oneOrNone("SELECT id FROM Users WHERE uid=$1", uid)];
                case 1:
                    existing = _a.sent();
                    if (!(existing && existing.id)) return [3 /*break*/, 3];
                    query = "UPDATE Users SET name = $1, email = $2, metadata = $3 WHERE id = $4 AND uid = $5 RETURNING *";
                    return [4 /*yield*/, db.one(query, [name, email, { image: image }, existing.id, uid])];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    query = "INSERT INTO Users (uid, name, email, metadata) VALUES ($1, $2, $3, $4) RETURNING *";
                    return [4 /*yield*/, db.one(query, [uid, name, email, { image: image }])];
                case 4: return [2 /*return*/, _a.sent()];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_4 = _a.sent();
                    console.log("DB error saving user", error_4);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function saveUserGitHubInfo(uid, username, token) {
    return __awaiter(this, void 0, void 0, function () {
        var val, existing, query, query, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    val = JSON.stringify({ username: username, token: token });
                    return [4 /*yield*/, db.oneOrNone("SELECT id FROM Users WHERE uid=$1", uid)];
                case 1:
                    existing = _a.sent();
                    if (!(existing && existing.id)) return [3 /*break*/, 3];
                    query = "UPDATE Users SET github = $1 WHERE uid = $2 RETURNING *";
                    return [4 /*yield*/, db.one(query, [val, uid])];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    query = "INSERT INTO Users (uid, github) VALUES ($1, $2) RETURNING *";
                    return [4 /*yield*/, db.one(query, [uid, val])];
                case 4: return [2 /*return*/, _a.sent()];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_5 = _a.sent();
                    console.log("DB error saving user", error_5);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function usernameAvailable(check) {
    return __awaiter(this, void 0, void 0, function () {
        var query, retval;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = "SELECT COUNT(*) FROM Users WHERE username = $1";
                    return [4 /*yield*/, db.one(query, [check])];
                case 1:
                    retval = _a.sent();
                    return [2 /*return*/, retval.count === '0'];
            }
        });
    });
}
function setUsername(uid, username) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = "UPDATE Users SET username=$1 WHERE uid = $2 RETURNING *";
                    return [4 /*yield*/, db.one(query, [username, uid])];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getUserByUID(uid) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = "SELECT * FROM Users WHERE uid = $1";
                    return [4 /*yield*/, db.oneOrNone(query, [uid])];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports["default"] = {
    getLines: getLines,
    saveLine: saveLine,
    deleteLine: deleteLine,
    saveUser: saveUser,
    saveUserGitHubInfo: saveUserGitHubInfo,
    usernameAvailable: usernameAvailable,
    setUsername: setUsername,
    getUserByUID: getUserByUID,
    getLineByUIDAndSlug: getLineByUIDAndSlug
};
