require('dotenv').config();
import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import session from 'express-session';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const { json } = require('body-parser');

polka() // You can also use Express
	.use(
		compression({ threshold: 0 }),
		json(),
		session({
			secret: process.env.SESSION_SECRET,
			resave: true,
			saveUninitialized: true,
			cookie: {
				maxAge: 259200
			},
		}),
		sirv('static', { dev }),
		sapper.middleware({
			session: (req, res) => ({
				user: req.session.user
			})
		}),
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
