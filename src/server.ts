require('dotenv').config();
import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const { json } = require('body-parser');

polka() // You can also use Express
	.use(
		compression({ threshold: 0 }),
		json(),
		sirv('static', { dev }),
		sapper.middleware({
			session: (req, res) => ({
				user: false
			})
		}),
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
