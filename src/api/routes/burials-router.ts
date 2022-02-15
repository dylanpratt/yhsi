import express, { Request, Response } from "express";
import { DB_CONFIG } from '../config';
import knex from "knex";
import { ReturnValidationErrors } from '../middleware';
import { param, query } from 'express-validator';

export const burialsRouter = express.Router();
const db = knex(DB_CONFIG);

burialsRouter.get(
	'/',
	[
		query('page').default(0).isInt(),
		query('limit').default(10).isInt({ gt: 0 }),
	],
	ReturnValidationErrors,
	async (req: Request, res: Response) => {
		const { textToMatch = '', sortBy = 'LastName', sort = 'asc' } = req.query;
		const filters = { FirstName: 'Abb'};
		const page = parseInt(req.query.page as string);
		const limit = parseInt(req.query.limit as string);
		const offset = page * limit || 0;
		let counter = [{ count: 0 }];
		let burials = [];
// filter by names, birth and death dates, gender, cause and manner of death, cemetery, other location, country of origin
		if (textToMatch || filters) {
			console.log(filters);
			counter = await db
				.from('Burial.Burial')
				.where('FirstName', 'like', `%${textToMatch}%`)
                .orWhere('LastName', 'like', `%${textToMatch}%`)
                .orWhere('Gender', 'like', `%${textToMatch}%`)
                .orWhere('BirthYear', 'like', `%${textToMatch}%`)
                .orWhere('DeathYear', 'like', `%${textToMatch}%`)
                .orWhere('Manner', 'like', `%${textToMatch}%`)
                .orWhere('CauseID', 'like', `%${textToMatch}%`)
                .orWhere('CemetaryID', 'like', `%${textToMatch}%`)
                .orWhere('OtherCemetaryDesc', 'like', `%${textToMatch}%`)
				.orWhere('OriginCity', 'like', `%${textToMatch}%`)
				.orWhere('OriginState', 'like', `%${textToMatch}%`)
				.orWhere('OriginCountry', 'like', `%${textToMatch}%`)
				.orWhere('OtherCountry', 'like', `%${textToMatch}%`)
				// test below
				.andWhere('FirstName', 'like', `%${filters.FirstName}%`)
				/*
                .andWhere('LastName', 'like', `%${textToMatch}%`)
                .andWhere('Gender', 'like', `%${textToMatch}%`)
                .andWhere('BirthYear', 'like', `%${textToMatch}%`)
                .andWhere('DeathYear', 'like', `%${textToMatch}%`)
                .andWhere('Manner', 'like', `%${textToMatch}%`)
                .andWhere('CauseID', 'like', `%${textToMatch}%`)
                .andWhere('CemetaryID', 'like', `%${textToMatch}%`)
                .andWhere('OtherCemetaryDesc', 'like', `%${textToMatch}%`)
				.andWhere('OriginCity', 'like', `%${textToMatch}%`)
				.andWhere('OriginState', 'like', `%${textToMatch}%`)
				.andWhere('OriginCountry', 'like', `%${textToMatch}%`)
				.andWhere('OtherCountry', 'like', `%${textToMatch}%`)*/
				.count('BurialID', { as: 'count' });

			burials = await db
				.select('*')
				.from('Burial.Burial')
				.where('FirstName', 'like', `%${textToMatch}%`)
                .orWhere('LastName', 'like', `%${textToMatch}%`)
                .orWhere('Gender', 'like', `%${textToMatch}%`)
                .orWhere('BirthYear', 'like', `%${textToMatch}%`)
                .orWhere('DeathYear', 'like', `%${textToMatch}%`)
                .orWhere('Manner', 'like', `%${textToMatch}%`)
                .orWhere('CauseID', 'like', `%${textToMatch}%`)
                .orWhere('CemetaryID', 'like', `%${textToMatch}%`)
                .orWhere('OtherCemetaryDesc', 'like', `%${textToMatch}%`)
				.orWhere('OriginCity', 'like', `%${textToMatch}%`)
				.orWhere('OriginState', 'like', `%${textToMatch}%`)
				.orWhere('OriginCountry', 'like', `%${textToMatch}%`)
				.orWhere('OtherCountry', 'like', `%${textToMatch}%`)
				.andWhere('FirstName', 'like', `%${filters.FirstName}%`)
				.orderBy(`${sortBy}`, `${sort}`)
				.limit(limit)
				.offset(offset);
		} else {
			counter = await db.from('Burial.Burial').count('BurialID', { as: 'count' });

			burials = await db
				.select('*')
				.from('Burial.Burial')
				.orderBy(`${sortBy}`, `${sort}`)
				.limit(limit)
				.offset(offset);
		}
/*
		for (const boat of boats) {
			boat.owners = await db
				.select('boat.boatowner.currentowner', 'boat.Owner.OwnerName')
				.from('boat.boatowner')
				.join('boat.Owner', 'boat.BoatOwner.ownerid', '=', 'boat.owner.id')
				.where('boat.boatowner.boatid', boat.Id);
		}
		*/

		res.status(200).send({ count: counter[0].count, body: burials });
	}
);

burialsRouter.get(
	'/:boatId',
	[param('boatId').notEmpty()],
	ReturnValidationErrors,
	async (req: Request, res: Response) => {
		const { boatId } = req.params;
		/*   const db = req.app.get('db');
    
      const permissions = req.decodedToken['yg-claims'].permissions;
      if (!permissions.includes('view')) res.sendStatus(403);
     */
		const boat = await db
			.select('*')
			.from('boat.boat')
			.where('boat.boat.id', boatId)
			.first();

		if (!boat) {
			res.status(403).send('Boat id not found');
			return;
		}

		boat.pastNames = await db
			.select('*')
			.from('boat.pastnames')
			.where('boat.pastnames.boatid', boatId);

		boat.owners = await db
			.select(
				'boat.boatowner.currentowner',
				'boat.Owner.OwnerName',
				'boat.owner.id'
			) //added boat.owner.id to the query (I need this for the details button)
			.from('boat.boatowner')
			.join('boat.Owner', 'boat.BoatOwner.ownerid', '=', 'boat.owner.id')
			.where('boat.boatowner.boatid', boatId);

		boat.histories = await db
			.select('*')
			.from('boat.history')
			.where('boat.history.uid', boatId);

		res.status(200).send(boat);
	}
);

// changed this route from "/new" to "/" to follow RESTFUL conventions
burialsRouter.post('/', async (req: Request, res: Response) => {
	/*   const db = req.app.get('db');
  
    const permissions = req.decodedToken['yg-claims'].permissions;
    if (!permissions.includes('create')) res.sendStatus(403);
   */
	const {
		boat = {},
		ownerNewArray = [],
		histories = [],
		pastNamesNewArray = [],
	} = req.body;

	const response = await db
		.insert(boat)
		.into('boat.boat')
		.returning('*')
		.then(async (rows: any) => {
			const newBoat = rows[0];

			if (ownerNewArray.length) {
				const newOwners = ownerNewArray.map((owner: any) => ({
					...owner,
					BoatId: newBoat.Id,
				}));

				await db
					.insert(newOwners)
					.into('boat.boatowner')
					.returning('*')
					.then((rows: any) => {
						return rows;
					});
			}

			//Add the new past names (done)
			await db
				.insert(
					pastNamesNewArray.map((name: any) => ({
						BoatId: newBoat.Id,
						...name,
					}))
				)
				.into('boat.pastnames')
				.then((rows: any) => {
					return rows;
				});

			if (histories.length) {
				const newHistories = histories.map((history: any) => ({
					...history,
					UID: newBoat.Id,
				}));
				await db
					.insert(newHistories)
					.into('boat.history')
					.returning('*')
					.then((rows: any) => {
						return rows;
					});
			}

			return newBoat;
		});

	res.send(response);
});

burialsRouter.put('/:boatId', async (req: Request, res: Response) => {
	/*  const db = req.app.get('db');
   const permissions = req.decodedToken['yg-claims'].permissions;
   if (!permissions.includes('edit')) res.sendStatus(403);
  */
	const {
		boat = {},
		ownerNewArray = [],
		ownerRemovedArray = [],
		pastNamesNewArray = [],
		pastNamesEditArray = [],
	} = req.body;
	const { boatId } = req.params;
	//make the update

	await db('boat.boat').update(boat).where('boat.boat.id', boatId);

	//Add the new owners (done)
	await db
		.insert(ownerNewArray.map((owner: any) => ({ BoatId: boatId, ...owner })))
		.into('boat.boatowner')
		.then((rows: any) => {
			return rows;
		});

	//remove the previous owners (done)
	for (const obj of ownerRemovedArray) {
		await db('boat.boatowner').where('boat.boatowner.ownerid', obj.id).del();
	}

	//update the past names (seems to work!)
	for (const obj of pastNamesEditArray) {
		await db('boat.pastnames')
			.update({ BoatName: obj.BoatName })
			.where('boat.pastnames.Id', obj.Id)
			.andWhere('boat.pastnames.BoatId', boatId);
	}

	//Add the new past names (done)
	await db
		.insert(pastNamesNewArray.map((name: any) => ({ BoatId: boatId, ...name })))
		.into('boat.pastnames')
		.then((rows: any) => {
			return rows;
		});

	res.status(200).send({ message: 'success' });
});
