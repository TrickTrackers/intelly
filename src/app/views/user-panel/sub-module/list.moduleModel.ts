// export class ListModuleModel {
//     name:string;
//     legoId: number;
//     legoName: string;
//     parentId: number;
//     ownerId: number;
//     legoLevel: number;
//     position:number;
//     companyId: number;
//     definition:  string;
//     scope:  string;
//     referenceLegoId: number;
//     legoType: string;
//     delFlag:  string;
//     type:  string;
//     cType: string;
//     children = new Array<ListModuleModel>();
//     "label": string;
//     "icon": string;
//     "url": string;
//     "params": object;
//     "expanded": boolean;
// }

export class ListModuleModel {
    name:string;
    legoId: number;
    legoName: string;
    parentId: number;
    ownerId: number;
    legoLevel: number;
    position:number;
    companyId: number;
    definition:  string;
    scope:  string;
    referenceLegoId: number;
    legoType: string;
    delFlag:  string;
    type:  string;
    cType: string;
    children = new Array<ListModuleModel>();
    "label": string;
    "icon": string;
    "url": string;
    "params": object;
    "expanded": boolean;
    "linkDoc": string;
    "docDate": string;
    "title": string;
    "version": number;
    "document": number;
    "count": number;
    partialSelected?: boolean;
}

export class ListModuleModel1 {
    name:string;
    legoId: number;
    legoName: string;
    parentId: number;
    ownerId: number;
    legoLevel: number;
    position:number;
    companyId: number;
    definition:  string;
    scope:  string;
    referenceLegoId: number;
    legoType: string;
    delFlag:  string;
    type:  string;
    cType: string;
    children = new Array<ListModuleModel1>();
    "label": string;
    "icon": string;
    "url": string;
    "params": object;
    "expanded": boolean;
    tab: string;
    titleType: string;
    userName: string;
    savFlag: string;
    moduleId: number;
}