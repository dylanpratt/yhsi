import { knex, Knex } from "knex";
import { QueryStatement, SortStatement } from "./";
import { AlternateName, Association, ConstructionPeriod, Contact, Dates, Description, FirstNationName, FnAssociation, FunctionalUse, HistoricalPattern, Name, Ownership, Place, PLACE_FIELDS, PlacePhoto, PlaceType, PlaceHistory, PreviousOwnership, REGISTER_FIELDS, RevisionLog, Theme, WebLink, YtPlace, YTPLACE_FIELDS } from "../data";
import { GenericEnum } from "./static-service";
import _ from "lodash";

export class YtPlaceService {

    private knex: Knex;

    constructor(config: Knex.Config<any>) {
        this.knex = knex(config);
    }

    async getAll(skip: number, take: number): Promise<Array<YtPlace>> {
        return this.knex("place.place").select<YtPlace[]>(YTPLACE_FIELDS).orderBy("id").offset(skip).limit(take);
    }

    async getById(id: number): Promise<YtPlace | undefined> {
        return this.knex("place.place").select<YtPlace>(YTPLACE_FIELDS).where({ id: id }).first()
            .catch(err => { console.log("BOMBED", err); return undefined; })
    }

    async getPlaceCount(): Promise<number> {
        return new Promise(async (resolve, reject) => {
            let results = await this.knex<number>("place").count("*", { as: 'count' })

            if (results) {
                let val = results[0].count as number;
                resolve(val)
            }

            resolve(0);
        })
    }

    async addPlace(item: Place): Promise<Place | undefined> {
        return this.knex("place").insert(item).returning<Place>(PLACE_FIELDS);
    }

    async updatePlace(id: number, item: Place): Promise<Place | undefined> {
        return this.knex("place").where({ id }).update(item);
    }

    async generateIdFor(nTSMapSheet: string): Promise<string> {
        let maxPlace = await this.knex("place").where({ nTSMapSheet }).max("yhsiId", { as: "maxVal" });

        if (maxPlace && maxPlace.length == 1 && maxPlace[0].maxVal) {
            let val = maxPlace[0].maxVal;
            let parts = val.split("/");
            let lastPart = parseInt(parts[2]);

            lastPart++;

            let strVal = lastPart.toString().padStart(3, "0");
            return `${nTSMapSheet}/${strVal}`;
        }

        return `${nTSMapSheet}/001`;
    }

    async getPlaceTypesFor(placeId: number): Promise<PlaceType[]> {
        //return this.knex("place.placetype").where({ id: placeId }).select<PlaceType[]>("type");
        return this.knex("place.placetype").where({ id: placeId }).select<PlaceType[]>(["id", "type"]);
    }

    async getFirstNationNamesFor(id: number): Promise<FirstNationName[]> {
        return this.knex("place.FirstNationName").where({ placeId: id }).select<FirstNationName[]>(["id", "placeId","fnName"]);
    }   

    async getAlternateNamesFor(id: number): Promise<AlternateName[]> {
        return this.knex("place.AlternateName").where({ placeId: id }).select<AlternateName[]>(["id", "placeId","alternateName"]);
    }   

    async getPlaceHistoriesFor(id: number): Promise<PlaceHistory[]> {
        return this.knex("place.PlaceHistory").where({ placeId: id }).select<PlaceHistory[]>(["id", "placeId","historyText", "reference", "restricted"]);
    }  

    async getPlacePhotosFor(id: number): Promise<PlacePhoto[]> {
        return this.knex("place.PlacePhoto").where({ placeId: id }).select<PlacePhoto[]>(["id", "placeId", "photoRowId"]);
    }

    async getFNAssociationsFor(id: number): Promise<FnAssociation[]> {
        return this.knex("place.FnAssociation").where({ placeId: id }).select<FnAssociation[]>(["placeId", "firstNationId", "fNAssociationType"]);
    }

    async addFNAssociation(name: FnAssociation) {
        return this.knex("place.FnAssociation").insert(name);
    }

    // Need to match by placeId and firstNationId
    async removeFNAssociation(id: number) {
        return this.knex("place.FnAssociation").where({ id }).delete();
    }

    async getNamesFor(id: number) {
        return this.knex("name").where({ placeId: id }).select<Name[]>(["id", "placeId", "description"]);
    }

    async addSecondaryName(name: Name) {
        return this.knex("name").insert(name);
    }

    async removeSecondaryName(id: number) {
        return this.knex("name").where({ id }).delete();
    }

    async getHistoricalPatternsFor(id: number): Promise<HistoricalPattern[]> {
        return this.knex("historicalpattern").where({ placeId: id }).select<HistoricalPattern[]>(["id", "placeId", "comments", "historicalPatternType"]);
    }

    async addHistoricalPattern(name: Name) {
        return this.knex("historicalpattern").insert(name);
    }

    async removeHistoricalPattern(id: number) {
        return this.knex("historicalpattern").where({ id }).delete();
    }

    async getDatesFor(id: number): Promise<Dates[]> {
        return this.knex("dates").where({ placeId: id }).select<Dates[]>(["id", "placeId", "type", "fromDate", "toDate", "details"]);
    }

    async addDate(name: Dates) {
        return this.knex("dates").insert(name);
    }

    async removeDate(id: number) {
        return this.knex("dates").where({ id }).delete();
    }

    async getConstructionPeriodsFor(id: number): Promise<ConstructionPeriod[]> {
        return this.knex("constructionperiod").where({ placeId: id }).select<ConstructionPeriod[]>(["id", "placeId", "type"]);
    }

    async addConstructionPeriod(name: ConstructionPeriod) {
        return this.knex("constructionperiod").insert(name);
    }

    async removeConstructionPeriod(id: number) {
        return this.knex("constructionperiod").where({ id }).delete();
    }

    async getThemesFor(id: number): Promise<Theme[]> {
        return this.knex("theme").where({ placeId: id }).select<Theme[]>(["id", "placeId", "placeThemeId"]);
    }

    async addTheme(name: Theme) {
        return this.knex("theme").insert(name);
    }

    async removeTheme(id: number) {
        return this.knex("theme").where({ id }).delete();
    }

    async getFunctionUsesFor(id: number): Promise<FunctionalUse[]> {
        return this.knex("FunctionalUse").where({ placeId: id }).select<FunctionalUse[]>(["id", "placeId", "functionalTypeId", "functionalUseType", "description"]);
    }

    async addFunctionalUse(name: FunctionalUse) {
        return this.knex("FunctionalUse").insert(name);
    }

    async removeFunctionalUse(id: number) {
        return this.knex("FunctionalUse").where({ id }).delete();
    }

    async getOwnershipsFor(id: number): Promise<Ownership[]> {
        return this.knex("Ownership").where({ placeId: id }).select<Ownership[]>(["id", "placeId", "ownershipType", "comments"]);
    }

    async addOwnership(name: Ownership) {
        return this.knex("Ownership").insert(name);
    }

    async removeOwnership(id: number) {
        return this.knex("Ownership").where({ id }).delete();
    }

    async addPreviousOwnership(name: PreviousOwnership) {
        return this.knex("PreviousOwnership").insert(name);
    }

    async removePreviousOwnership(id: number) {
        return this.knex("PreviousOwnership").where({ id }).delete();
    }

    async getContactsFor(id: number): Promise<Contact[]> {
        return this.knex("Contact").where({ placeId: id }).select<Contact[]>(["id", "placeId", "firstName", "lastName", "phoneNumber", "email", "mailingAddress", "description", "contactType"]);
    }

    async addContact(name: Contact) {
        return this.knex("Contact").insert(name);
    }

    async removeContact(id: number) {
        return this.knex("Contact").where({ id }).delete();
    }

    async getRevisionLogFor(id: number): Promise<RevisionLog[]> {
        return this.knex("RevisionLog").where({ placeId: id }).select<RevisionLog[]>(["id", "placeId", "revisionLogType", "revisionDate", "revisedBy", "details"]).orderBy("revisionDate");
    }

    async addRevisionLog(name: RevisionLog) {
        return this.knex("RevisionLog").insert(name);
    }

    async removeRevisionLog(id: number) {
        return this.knex("RevisionLog").where({ id }).delete();
    }

    async getWebLinksFor(id: number): Promise<WebLink[]> {
        return this.knex("WebLink").where({ placeId: id }).select<WebLink[]>(["id", "placeId", "type", "address"]);
    }

    async addWebLink(name: WebLink) {
        return this.knex("WebLink").insert(name);
    }

    async removeWebLink(id: number) {
        return this.knex("WebLink").where({ id }).delete();
    }

    async getDescriptionsFor(id: number): Promise<Description[]> {
        return this.knex("Description").where({ placeId: id }).select<Description[]>(["id", "placeId", "descriptionText", "type"]);
    }

    async addDescription(name: Description) {
        return this.knex("Description").insert(name);
    }

    async removeDescription(id: number) {
        return this.knex("Description").where({ id }).delete();
    }


    async doSearch(query: Array<QueryStatement>, sort: Array<SortStatement>, page: number, page_size: number, skip: number, take: number): Promise<any> {
        return new Promise(async (resolve, reject) => {

            let selectStmt = this.knex("place.place").distinct().select(YTPLACE_FIELDS);
                //.leftOuterJoin("firstnationassociation", "place.id", "firstnationassociation.placeid")
                //.leftOuterJoin("constructionPeriod", "place.id", "constructionPeriod.placeid")
            //.leftOuterJoin("revisionLog", "place.id", "revisionLog.placeid")
            //.leftOuterJoin("description", "place.id", "description.placeid");

            if (query && query.length > 0) {

                query.forEach((stmt: any) => {
                    switch (stmt.operator) {
                        case "eq": {
                            let p = {};
                            let m = `{"${stmt.field}": "${stmt.value}"}`;
                            Object.assign(p, JSON.parse(m));
                            selectStmt.orWhere(p);
                            break;
                        }
                        case "in": {
                            let items = stmt.value.split(',');
                            selectStmt.orWhereIn(stmt.field, items);
                            break;
                        }
                        case "notin": {
                            let items = stmt.value.split(',');
                            selectStmt.whereNotIn(stmt.field, items);
                            break;
                        }
                        case "gt": {
                            selectStmt.orWhere(stmt.field, '>', stmt.value);
                            break;
                        }
                        case "gte": {
                            selectStmt.orWhere(stmt.field, '>=', stmt.value);
                            break;
                        }
                        case "lt": {
                            selectStmt.orWhere(stmt.field, '<', stmt.value);
                            break;
                        }
                        case "lte": {
                            //console.log(`Testing ${stmt.field} for IN on ${stmt.value}`)
                            selectStmt.orWhere(stmt.field, '<=', stmt.value);
                            break;
                        }
                        case "contains": {
                            selectStmt.orWhereRaw(`LOWER(${stmt.field}) like '%${stmt.value.toLowerCase()}%'`);
                            break;
                        }
                        default: {
                            console.log(`IGNORING ${stmt.field} on ${stmt.value}`)
                        }
                    }
                })
            }

            if (sort && sort.length > 0) {
                sort.forEach(stmt => {
                    selectStmt.orderBy(stmt.field, stmt.direction);
                })
            }
            else {
                selectStmt.orderBy("place.id");
            }

            let fullData = await selectStmt;
            let uniqIds = _.uniq(fullData.map(i => i.id));
            let count = uniqIds.length;
            let page_count = Math.ceil(count / page_size);

            let data = await selectStmt.offset(skip).limit(take);
            let results = { data, meta: { page, page_size, item_count: count, page_count } };

            resolve(results);
        })
    }

}
