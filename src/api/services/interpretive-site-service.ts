import knex, { Knex } from 'knex';
import { QueryStatement, SortStatement } from './';
import { Photo, PHOTO_FIELDS } from '../data';
import { DB_CONFIG } from '../config';
import { burialsRouter } from 'routes';
const db = knex(DB_CONFIG);
export class InterpretiveSiteService {

    //SITES
	async getAllSites(){
        const sortBy = 'SiteName';
		const sort = 'asc';

		return await db
        .select('*')
        .from('InterpretiveSite.Sites')
        .orderBy(`${sortBy}`, `${sort}`);
	}

	async getSiteById(siteId: number) {	
        const item= await db
			.select('*')
			.from('InterpretiveSite.Sites')
			.where('InterpretiveSite.Sites.SiteID', siteId)
			.first();

		if (!item) {
			return null;
		}

		item.actions = await db
			.select('*')
			.from('InterpretiveSite.Actions')
			.where('InterpretiveSite.Actions.SiteID', siteId);

        item.assets = await db
			.select('*')
			.from('InterpretiveSite.Assets')
			.where('InterpretiveSite.Actions.SiteID', siteId);

        item.maintainer = await db
			.select('*')
			.from('InterpretiveSite.Maintainer')
			.where('InterpretiveSite.Maintainer.SiteID', siteId);
            
        return item;
    }

	async addSite(item: any, assets: any, actions: any, inspections: any){
		const res = await db
		.insert(item)
		.into('InterpretiveSite.Sites')
		.returning('*')
		.then(async (rows: any) => {
			const newSite = rows[0];

			//ASSETS
			newSite.assets = await db
				.insert(
					assets.map((item: any) => ({
						...item,
						SiteID: newSite.SiteID,
					}))
				)
				.into('InterpretiveSite.Assets')
				.returning('*')
				.then((rows: any) => {
					return rows;
				});


			//ACTIONS
			newSite.actions = await db
				.insert(
					actions.map((item: any) => ({
						SiteID: newSite.SiteID,
						...item,
					}))
				)
				.into('InterpretiveSite.Actions')
				.then((rows: any) => {
					return rows;
				});
			
			//INSPECTIONS
			newSite.inspections = await db
				.insert(
					inspections.map((item: any) => ({
						...item,
						SiteID: newSite.SiteID,
					}))
				)
				.into('InterpretiveSite.Inspections')
				.returning('*')
				.then((rows: any) => {
					return rows;
				});
			
			
			return newSite;
		});
		return res;
	}

    async doSiteSearch( page: number, limit: number, offset: number, filters: any){
		let counter = [{ count: 0 }];
		let sites = [];
		const { textToMatch = '', RouteName = '', KMNum = '', MapSheet = '', sortBy, sort } = filters;
		//name,  route, km, mapsheet, established and maintained by
		if(limit === 0){
			counter = await db
				.from('InterpretiveSite.Sites')
				.where(builder => {
					if(textToMatch !== '') builder.where('SiteName', 'like', `%${textToMatch}%`);
					if(RouteName !== '') builder.where('RouteName', 'like', `%${RouteName}%`);
					if(KMNum !== '') builder.where('KMNum', 'like', `%${KMNum}%`);
					if(MapSheet !== '') builder.where('MapSheet', 'like', `%${MapSheet}%`);
                    // if(MapSheet !== '') builder.where('MapSheet', 'like', `%${ServiceEnd}%`);
                    // if(MapSheet !== '') builder.where('MapSheet', 'like', `%${ServiceEnd}%`);
				})
				.count('Id', { as: 'count' });

            sites = await db
				.select('*')
				.from('InterpretiveSite.Sites')
				.where(builder => {
					if(textToMatch !== '') builder.where('SiteName', 'like', `%${textToMatch}%`);
					if(RouteName !== '') builder.where('RouteName', 'like', `%${RouteName}%`);
					if(KMNum !== '') builder.where('KMNum', 'like', `%${KMNum}%`);
					if(MapSheet !== '') builder.where('MapSheet', 'like', `%${MapSheet}%`);
				})
				.orderBy(`${sortBy}`, `${sort}`);
		}
        else {
			counter = await db
				.from('InterpretiveSite.Sites')
				.where(builder => {
					if(textToMatch !== '') builder.where('SiteName', 'like', `%${textToMatch}%`);
					if(RouteName !== '') builder.where('RouteName', 'like', `%${RouteName}%`);
					if(KMNum !== '') builder.where('KMNum', 'like', `%${KMNum}%`);
					if(MapSheet !== '') builder.where('MapSheet', 'like', `%${MapSheet}%`);
				})
				.count('Id', { as: 'count' });

            sites = await db
				.select('*')
				.from('InterpretiveSite.Sites')
				.where(builder => {
					if(textToMatch !== '') builder.where('SiteName', 'like', `%${textToMatch}%`);
					if(RouteName !== '') builder.where('RouteName', 'like', `%${RouteName}%`);
					if(KMNum !== '') builder.where('KMNum', 'like', `%${KMNum}%`);
					if(MapSheet !== '') builder.where('MapSheet', 'like', `%${MapSheet}%`);
				})
				.orderBy(`${sortBy}`, `${sort}`)
				.limit(limit)
				.offset(offset);
		}
        return { count: counter[0].count, body: sites };

    }

    //ACTIONS

	async addAction(item: any){
		const res = await db
		.insert(item)
		.into('InterpretiveSite.Action')
		.returning('*')
		.then(async (rows: any) => {
			const newAction = rows[0];		
			return newAction;
		});
		return res;
	}

    async doActionSearch( page: number, limit: number, offset: number, filters: any){
		let counter = [{ count: 0 }];
		let actions = [ ""];
        const { 
			//textToMatch = '', 
			ActionDesc = '', 
			ToBeCompleteDate = '', 
			ActionCompleteDate = '', 
			CompletionDesc = '',
			Priority = '',
			CreatedBy = '',
			CreatedDate = '',
			CompletedBy = '',
			sortBy, 
			sort
		 } = filters;
        if(limit === 0){
			counter = await db
				.from('InterpretiveSite.Actions')
				.where(builder => {
					//if(textToMatch !== '') builder.where('SiteName', 'like', `%${textToMatch}%`);
					if(ActionDesc !== '') builder.where('ActionDesc', 'like', `%${ActionDesc}%`);
					if(ToBeCompleteDate !== '') builder.where('ToBeCompleteDate', 'like', `%${ToBeCompleteDate}%`);
					if(ActionCompleteDate !== '') builder.where('ActionCompleteDate', 'like', `%${ActionCompleteDate}%`);
					if(CompletionDesc !== '') builder.where('CompletionDesc', 'like', `%${CompletionDesc}%`);
					if(Priority !== '') builder.where('Priority', 'like', `%${Priority}%`);
					if(CreatedBy !== '') builder.where('CreatedBy', 'like', `%${CreatedBy}%`);
					if(CreatedDate !== '') builder.where('CreatedDate', 'like', `%${CreatedDate}%`);
					if(CompletedBy !== '') builder.where('CompletedBy', 'like', `%${CompletedBy}%`);
				})
				.count('Id', { as: 'count' });

            actions = await db
				.select('*')
				.from('InterpretiveSite.Actions')
				.where(builder => {
					//if(textToMatch !== '') builder.where('SiteName', 'like', `%${textToMatch}%`);
					if(ActionDesc !== '') builder.where('ActionDesc', 'like', `%${ActionDesc}%`);
					if(ToBeCompleteDate !== '') builder.where('ToBeCompleteDate', 'like', `%${ToBeCompleteDate}%`);
					if(ActionCompleteDate !== '') builder.where('ActionCompleteDate', 'like', `%${ActionCompleteDate}%`);
            		if(CompletionDesc !== '') builder.where('CompletionDesc', 'like', `%${CompletionDesc}%`);
					if(Priority !== '') builder.where('Priority', 'like', `%${Priority}%`);
					if(CreatedBy !== '') builder.where('CreatedBy', 'like', `%${CreatedBy}%`);
					if(CreatedDate !== '') builder.where('CreatedDate', 'like', `%${CreatedDate}%`);
					if(CompletedBy !== '') builder.where('CompletedBy', 'like', `%${CompletedBy}%`);
				})
				.orderBy(`${sortBy}`, `${sort}`);
		}
        else {
			counter = await db
				.from('InterpretiveSite.Actions')
				.where(builder => {
					//if(textToMatch !== '') builder.where('SiteName', 'like', `%${textToMatch}%`);
					if(ActionDesc !== '') builder.where('ActionDesc', 'like', `%${ActionDesc}%`);
					if(ToBeCompleteDate !== '') builder.where('ToBeCompleteDate', 'like', `%${ToBeCompleteDate}%`);
					if(ActionCompleteDate !== '') builder.where('ActionCompleteDate', 'like', `%${ActionCompleteDate}%`);
            		if(CompletionDesc !== '') builder.where('CompletionDesc', 'like', `%${CompletionDesc}%`);
					if(Priority !== '') builder.where('Priority', 'like', `%${Priority}%`);
					if(CreatedBy !== '') builder.where('CreatedBy', 'like', `%${CreatedBy}%`);
					if(CreatedDate !== '') builder.where('CreatedDate', 'like', `%${CreatedDate}%`);
					if(CompletedBy !== '') builder.where('CompletedBy', 'like', `%${CompletedBy}%`);
				})
				.count('Id', { as: 'count' });

            actions = await db
				.select('*')
				.from('InterpretiveSite.Actions')
				.where(builder => {
					//if(textToMatch !== '') builder.where('SiteName', 'like', `%${textToMatch}%`);
					if(ActionDesc !== '') builder.where('ActionDesc', 'like', `%${ActionDesc}%`);
					if(ToBeCompleteDate !== '') builder.where('ToBeCompleteDate', 'like', `%${ToBeCompleteDate}%`);
					if(ActionCompleteDate !== '') builder.where('ActionCompleteDate', 'like', `%${ActionCompleteDate}%`);
            		if(CompletionDesc !== '') builder.where('CompletionDesc', 'like', `%${CompletionDesc}%`);
					if(Priority !== '') builder.where('Priority', 'like', `%${Priority}%`);
					if(CreatedBy !== '') builder.where('CreatedBy', 'like', `%${CreatedBy}%`);
					if(CreatedDate !== '') builder.where('CreatedDate', 'like', `%${CreatedDate}%`);
					if(CompletedBy !== '') builder.where('CompletedBy', 'like', `%${CompletedBy}%`);
				})
				.orderBy(`${sortBy}`, `${sort}`)
				.limit(limit)
				.offset(offset);
		}
        return { count: counter[0].count, body: actions };

    }

    //ASSETS

	async addAssets(item: any){
		const res = await db
		.insert(item)
		.into('InterpretiveSite.Assets')
		.returning('*');

		return res;
	}

    async doAssetSearch( page: number, limit: number, offset: number, filters: any){
		let counter = [{ count: 0 }];
		let assets = [ ""];
        const { 
			//textToMatch = '', 
			Category = '', 
			Type = '', 
			Size = '', 
			Description = '',
			SignText = '',
			InstallDate = '',
			DecommissionDate = '',
			DecommissionNotes = '',
			Status = '',
			sortBy, 
			sort
		 } = filters;
        if(limit === 0){
			counter = await db
				.from('InterpretiveSite.Actions')
				.where(builder => {
					//if(textToMatch !== '') builder.where('SiteName', 'like', `%${textToMatch}%`);
					if(Category !== '') builder.where('Category', 'like', `%${Category}%`);
					if(Type !== '') builder.where('Type', 'like', `%${Type}%`);
					if(Size !== '') builder.where('Size', 'like', `%${Size}%`);
            		if(Description !== '') builder.where('Description', 'like', `%${Description}%`);
					if(SignText !== '') builder.where('SignText', 'like', `%${SignText}%`);
					if(InstallDate !== '') builder.where('InstallDate', 'like', `%${InstallDate}%`);
					if(DecommissionDate !== '') builder.where('DecommissionDate', 'like', `%${DecommissionDate}%`);
					if(DecommissionNotes !== '') builder.where('DecommissionNotes', 'like', `%${DecommissionNotes}%`);
					if(Status !== '') builder.where('Status', 'like', `%${Status}%`);
				})
				.count('Id', { as: 'count' });

			assets = await db
				.select('*')
				.from('InterpretiveSite.Actions')
				.where(builder => {
					//if(textToMatch !== '') builder.where('SiteName', 'like', `%${textToMatch}%`);
					if(Category !== '') builder.where('Category', 'like', `%${Category}%`);
					if(Type !== '') builder.where('Type', 'like', `%${Type}%`);
					if(Size !== '') builder.where('Size', 'like', `%${Size}%`);
            		if(Description !== '') builder.where('Description', 'like', `%${Description}%`);
					if(SignText !== '') builder.where('SignText', 'like', `%${SignText}%`);
					if(InstallDate !== '') builder.where('InstallDate', 'like', `%${InstallDate}%`);
					if(DecommissionDate !== '') builder.where('DecommissionDate', 'like', `%${DecommissionDate}%`);
					if(DecommissionNotes !== '') builder.where('DecommissionNotes', 'like', `%${DecommissionNotes}%`);
					if(Status !== '') builder.where('Status', 'like', `%${Status}%`);
				})
				.orderBy(`${sortBy}`, `${sort}`);
		}
        else {
			counter = await db
				.from('InterpretiveSite.Actions')
				.where(builder => {
					//if(textToMatch !== '') builder.where('SiteName', 'like', `%${textToMatch}%`);
					if(Category !== '') builder.where('Category', 'like', `%${Category}%`);
					if(Type !== '') builder.where('Type', 'like', `%${Type}%`);
					if(Size !== '') builder.where('Size', 'like', `%${Size}%`);
            		if(Description !== '') builder.where('Description', 'like', `%${Description}%`);
					if(SignText !== '') builder.where('SignText', 'like', `%${SignText}%`);
					if(InstallDate !== '') builder.where('InstallDate', 'like', `%${InstallDate}%`);
					if(DecommissionDate !== '') builder.where('DecommissionDate', 'like', `%${DecommissionDate}%`);
					if(DecommissionNotes !== '') builder.where('DecommissionNotes', 'like', `%${DecommissionNotes}%`);
					if(Status !== '') builder.where('Status', 'like', `%${Status}%`);
				})
				.count('Id', { as: 'count' });

			assets = await db
				.select('*')
				.from('InterpretiveSite.Actions')
				.where(builder => {
					//if(textToMatch !== '') builder.where('SiteName', 'like', `%${textToMatch}%`);
					if(Category !== '') builder.where('Category', 'like', `%${Category}%`);
					if(Type !== '') builder.where('Type', 'like', `%${Type}%`);
					if(Size !== '') builder.where('Size', 'like', `%${Size}%`);
            		if(Description !== '') builder.where('Description', 'like', `%${Description}%`);
					if(SignText !== '') builder.where('SignText', 'like', `%${SignText}%`);
					if(InstallDate !== '') builder.where('InstallDate', 'like', `%${InstallDate}%`);
					if(DecommissionDate !== '') builder.where('DecommissionDate', 'like', `%${DecommissionDate}%`);
					if(DecommissionNotes !== '') builder.where('DecommissionNotes', 'like', `%${DecommissionNotes}%`);
					if(Status !== '') builder.where('Status', 'like', `%${Status}%`);
				})
				.orderBy(`${sortBy}`, `${sort}`)
				.limit(limit)
				.offset(offset);
		}
        return { count: counter[0].count, body: assets };

    }

}
