import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import * as config from './config';
import { doHealthCheck } from './utils/healthCheck';
import { configureAuthentication } from './routes/auth';
import { RequiresAuthentication } from './middleware';

require('dotenv').config();

// const cors = require('cors'); // might want to remove before going to prod

var ownersRouter = require('./controllers/owners');
var historiesRouter = require('./controllers/histories');
var aircrashRouter = require('./controllers/aircrash');
var catalogsRouter = require('./controllers/catalogs');
var usersRouter = require('./controllers/users');
var peopleRouter = require('./controllers/people');
var photoOwners = require('./controllers/photoOwners');
var boatsRouter = require('./controllers/boats');
var photosRouter = require('./controllers/photos');

var knex = require('knex');

const app = express();
//var port = process.env.PORT || 3000;
var port = process.env.PORT || 4125;
var _ = require('lodash');

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(
	cors({
		origin: config.FRONTEND_URL,
		optionsSuccessStatus: 200,
		credentials: true,
	})
);

configureAuthentication(app);

app.get('/api/healthCheck', (req: Request, res: Response) => {
	res.send('API is up!');
});

console.log('host: ', process.env.DB_HOST);
console.log('user: ', process.env.DB_USER);
console.log('psss: ', process.env.DB_PASS);
console.log('db name: ', process.env.DB_NAME);

var conn = knex({
	client: 'mssql',
	connection: {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
		options: {
			enableArithAbort: true,
		},
	},
	useNullAsDefault: true,
});

app.set('db', conn);

// URI for tediousJS = `mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?encrypt=true`
// app.get('/', function (req: Request, res: Response) {
// 	const db = req.app.get('db');

// 	db.raw('SELECT TOP 1 * FROM Boat.Owner;')
// 		.then((rows: any) => {
// 			if (rows.length > 0) {
// 				console.log(rows);
// 				res.status(200).send('Successful Connection');
// 				return;
// 			}
// 		})
// 		.catch((e: Error) => {
// 			console.error(e);
// 			res
// 				.status(500)
// 				.send(
// 					"ERROR: Either the connection to the database isn't working or the query is incorrect"
// 				);
// 		});
// });

app.get('/', function (req: Request, res: Response) {
	res.json('API is up.');
});

app.use('/api/aircrash', aircrashRouter);
app.use('/api/owners', ownersRouter);
app.use('/api/histories', historiesRouter);
app.use('/api/photos', photosRouter);
app.use('/api/catalogs', catalogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/people', peopleRouter);
app.use('/api/photo-owners', photoOwners);
app.use('/api/boats', boatsRouter);

console.log(
	`Database Info: ${process.env.DB_HOST} ${process.env.DB_NAME}, `,
	port
);
app.listen(port);
