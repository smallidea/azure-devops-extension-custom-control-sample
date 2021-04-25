
import Q = require("q");

import VSS_Service = require("VSS/Service");
import TFS_Wit_Client = require("TFS/WorkItemTracking/RestClient"); //TFS/WorkItemTracking/RestClient
import TFS_Wit_Services = require("TFS/WorkItemTracking/Services");
import TFS_Core_WebApi = require("TFS/Core/RestClient");

/**
 * 
 * @returns 
 */
function getWorkItemFormService() {
    return TFS_Wit_Services.WorkItemFormService.getService();
}

/**
 * 
 */
export class APIHelper {
    private _witRestClient = TFS_Wit_Client.getClient();

    constructor() {
        //this._witRestClient = ADS.getClient(ADSWIT.WorkItemTrackingRestClient);
    }

    /**
     * 
     * @param workItemType 
     * @param fieldName 
     * @param fieldValue 
     * @returns 
     */
    public async uniqFieldValue(workItemType: string, currentWorkItemId: number, fieldName: string, fieldValue: any) {

        //This gets the correct project information
        var witClient = VSS_Service.getCollectionClient(TFS_Wit_Client.WorkItemTrackingHttpClient);
        var project = VSS.getWebContext().project;
        //var coreClient = TFS_Core_WebApi.getClient();

        const query = {
            query: `SELECT [System.Id]
                    FROM WorkItemLinks 
                    WHERE ([System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward') 
                        AND (Target.[System.TeamProject] = @project 
                        AND [Target].[System.WorkItemType] = '${workItemType}'
                        AND [Target].[System.Id] <> '${currentWorkItemId}'
                        AND [Target].[${fieldName}] = '${fieldValue}'
                        )  mode(Recursive, ReturnMatchingChildren)`
        };

        // 
        let workItemQueryResult = await witClient.queryByWiql(query, project.name, null);
        console.log('workItemQueryResult', workItemQueryResult)
        let workItemIds: number[] = [];
        workItemQueryResult.workItemRelations.forEach((item) => {

            if (item.source && workItemIds.indexOf(item.source.id) < 0) {
                workItemIds.push(item.source.id);
            }

            if (item.target && workItemIds.indexOf(item.target.id) < 0) {
                workItemIds.push(item.target.id);
            }

        });

        console.log('workItemIds: ', workItemIds);

        return (workItemIds && workItemIds.length > 0) == false;
    }
}