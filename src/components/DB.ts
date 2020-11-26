require('dotenv').config();

const slugify = require('slugify');
const sha256 = require('sha256');

const options = {};
const pgp = require('pg-promise')(options);
const defaultPostgresUrl = `postgres://postgres:${process.env.POSTGRES_PASSWORD}@localhost:5432/postgres`;
const connectionString = process.env.DATABASE_URL || defaultPostgresUrl;
const db = pgp(connectionString);

async function doCreate() {
    let exists_query = "SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lines'";
    try {
      let exists_results = await db.any(exists_query);
      // console.log("exists", exists_results);
      if (exists_results.length==0) {
        let users_query = "CREATE TABLE IF NOT EXISTS Users (id serial PRIMARY KEY, uid VARCHAR(255), email VARCHAR(255), name VARCHAR(255)";
        users_query += ", username VARCHAR(255), twitter VARCHAR(255), github VARCHAR(255), metadata JSONB, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)";
        await db.none(users_query);
        let lines_query = "CREATE TABLE IF NOT EXISTS Lines (id serial PRIMARY KEY, user_id INTEGER, slug VARCHAR(255)";
        lines_query += ", title VARCHAR(255), path VARCHAR(255), sha VARCHAR(255), metadata JSONB";
        lines_query += ", created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES Users (id))";
        await db.none(lines_query);
      }
    } catch(error) {
      console.log("create DB error", error);
    }
}

async function doUpdate() {
  let update_query = "SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lines'";
  try {
    let update_results = await db.any(update_query);
    // TODO: add indexes: uid on user, user_id/slug unique index on lines
  } catch(error) {
    console.log("update DB error", error);
  }
}

doCreate();
doUpdate();

async function getLines(offset:number = 20) {
    let query = `SELECT * FROM LINES ORDER BY created_at DESC LIMIT ${offset}`;
    return await db.any(query);
}

async function saveLine(title:string, userid:string, sha:string, originalTitle:string) {
  try {
    let user = await db.oneOrNone("SELECT * FROM Users WHERE uid=$1", userid);

    let rename = originalTitle && originalTitle != title;
    let slug = slugify(title, {lower: true, strict: true, locale: 'en'});
    let originalSlug = slugify(originalTitle || '', {lower: true, strict: true, locale: 'en'});
    let path = sha256(user.email).substring(0,8); // TODO username

    let existing = null;
    if (rename) {
      existing = await db.oneOrNone("SELECT * FROM Lines WHERE user_id=$1 AND slug=$2", [user.id, originalSlug]);
    } else {
      existing = await db.oneOrNone("SELECT * FROM Lines WHERE user_id=$1 AND slug=$2", [user.id, slug]);
    }

    if (existing) {
      let query = "UPDATE Lines SET slug = $1, title = $2, path = $3, sha = $4 WHERE user_id = $5 AND slug = $6 RETURNING *"
      return await db.one(query, [slug, title, path, sha, user.id, rename ? originalSlug : slug]);
    } else {
      let query = "INSERT INTO Lines (user_id, slug, title, path, sha) VALUES ($1, $2, $3, $4, $5) RETURNING *";
      return await db.one(query, [user.id, slug, title, path, sha]);
    }
  } catch(error) {
    console.log("DB error saving line", error);
  }
}

async function saveUser(uid:string, email:string, name:string, image:string) {
  try {
    let existing = await db.oneOrNone("SELECT * FROM Users WHERE uid=$1", uid);
    if (existing && existing.id) {
      let query = "UPDATE Users SET name = $1, email = $2, metadata = $3 WHERE id = $4 AND uid = $5 RETURNING *";
      return await db.one(query, [name, email, {image:image}, existing.id, uid]);
    } else {
      let query = "INSERT INTO Users (uid, name, email, metadata) VALUES ($1, $2, $3, $4) RETURNING *";
      return await db.one(query, [uid, name, email, {image:image}]);
    }
  } catch(error) {
    console.log("DB error saving user", error);
  }
}

export default {
  getLines: getLines,
  saveLine: saveLine,
  saveUser: saveUser
}
