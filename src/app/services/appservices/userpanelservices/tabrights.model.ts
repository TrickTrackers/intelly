export class ListRightsModel {
    legoId: number;
    tabName: string;
    assessmentRights: string;
    detailsRights: string;
    connectionRights: string;
    workflowRights: string;
    documentRights: string;
    groupId: number;
    employeeId: number;
    companyId: number;
    referenceLegoId: number;
    constructor(init?:Partial<ListRightsModel>) {
        Object.assign(this, init);
    }
}