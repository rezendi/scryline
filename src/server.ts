require('dotenv').config();

import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

var session = require('express-session');
var FileStore = require('session-file-store')(session);

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const { json } = require('body-parser');

polka() // You can also use Express
	.use(
		compression({ threshold: 0 }),
		json(),
		session({
			store: new FileStore({}),
			secret: process.env.SESSION_SECRET,
			resave: true,
			saveUninitialized: true,
			cookie: {
				maxAge: 259200
			},
		}),
		sirv('static', { dev }),
		sapper.middleware({
			session: (req, res) => {
				return { user: req.session.user || { email:'' } };
			}
		}),
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
