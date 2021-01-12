require('dotenv').config();

import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

var session = require('express-session');
let sessionStore;
if (process.env.NODE_ENV=="production") {
	const redis = require('redis')
	var RedisStore = require('connect-redis')(session);
	let redisClient = redis.createClient({url:"redis://redis:6379"});
	sessionStore = new RedisStore({ client: redisClient });
} else {
	var FileStore = require('session-file-store')(session);
	sessionStore = new FileStore({});
}

const { json } = require('body-parser');

console.log("running in", process.env.NODE_ENV);

polka()
	.use(
		compression({ threshold: 0 }),
		json({limit: '50mb'}),
		session({
			store: sessionStore,
			secret: process.env.SESSION_SECRET,
			resave: true,
			saveUninitialized: true,
			cookie: {
				maxAge: 259200 * 1000 // 3 days in milliseconds
			},
		}),
		sirv('static', { dev: process.env.NODE_ENV === 'development' }),
		sapper.middleware({
			session: (req, res) => {
				return { sUser: req.session.sUser || { email:''}, test_mode:process.env.SAPPER_ENV=="test" };
			}
		}),
	)
	.listen(process.env.PORT, err => {
		if (err) console.log('error', err);
	});
