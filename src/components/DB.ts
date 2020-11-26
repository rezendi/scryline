require('dotenv').config();

let options = {};
let pgp = require('pg-promise')(options);
let defaultPostgresUrl = `postgres://postgres:${process.env.POSTGRES_PASSWORD}@localhost:5432/postgres`;
let connectionString = process.env.DATABASE_URL || defaultPostgresUrl;
var db = pgp(connectionString);

async function doStartup() {
    let exists_query = "SELECT *  FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'";
    try {
      let exists_results = await db.any(exists_query);
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
      console.log("startup DB error", error);
    }
}

doStartup();

function getLines(offset:number = 20) {
    let query = `SELECT * FROM LINES ORDER BY created_at DESC LIMIT ${offset}`;
    return db.any(query);
}

export default {
  getLines: getLines
}