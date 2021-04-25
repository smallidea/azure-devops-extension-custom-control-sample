/** The class control.ts will orchestrate the classes of InputParser, Model and View
 *  in order to perform the required actions of the extensions. 
 */

import * as WitService from "TFS/WorkItemTracking/Services";
import { Model } from "./model";
import { View } from "./view";
import { ErrorView } from "./errorView";
import * as Q from "q";
import { APIHelper } from "./common/apiHelper"

export class Controller {
    private _fieldName = "";
    private _workItemType = "";
    private _workItemId: number;

    private _inputs: IDictionaryStringTo<string>;
    private _model: Model;
    private _view: View;

    constructor() {
        this._initialize();
    }

    /**
     * 
     */
    private _initialize(): void {
        this._inputs = VSS.getConfiguration().witInputs;
        this._fieldName = this._inputs["FieldName"];

        WitService.WorkItemFormService.getService().then(
            (service) => {
                Q.spread(
                    [service.getFieldValue(this._fieldName), service.getFieldValue('System.WorkItemType'), service.getFieldValue('System.ID')],
                    (currentValue: string, workItemType: string, workItemId: number) => {
                        service.setFieldValue(this._fieldName, currentValue);
                        // dependent on view, model, and inputParser refactoring
                        this._model = new Model(currentValue);
                        this._view = new View(this._model, (val) => {
                            this._updateInternal(val);
                        });
                        this._workItemType = workItemType;
                        this._workItemId = workItemId;

                        //Force update markdown after view is created.
                        this._view.update(currentValue);

                    }, this._handleError
                ).then(null, this._handleError);
            },
            this._handleError);
    }

    /**
     * 
     * @param error 
     */
    private _handleError(error: string): void {
        new ErrorView(error);
    }

    /**
     * 
     * @param value 
     */
    private _updateInternal(value: string): void {
        WitService.WorkItemFormService.getService().then(
            (service) => {
                // 验证唯一性
                this._validUniq(this._workItemId, value).then(isValid => {
                    if (isValid == false) {
                        service.setError(`${value} 已经在当前团队项目中被使用，请使用其他！`);
                        //TODO: 是否跨团队项目可选
                    } else {
                        service.clearError();
                        service.setFieldValue(this._fieldName, value).then(
                            () => {
                                this._update(value);
                            }, this._handleError);
                    }

                });

            },
            this._handleError
        );


    }

    /**
     * 
     * @param workItemId 
     * @param value 
     * @returns 
     */
    private async _validUniq(workItemId: number, value: string): Promise<boolean> {
        let apiHelper: APIHelper = new APIHelper();
        let result = await apiHelper.uniqFieldValue(this._workItemType, workItemId, this._fieldName, value);
        return result;
    }

    /**
     * 
     * @param value 
     */
    private _update(value: string): void {
        this._model.setCurrentValue(value);
        this._view.update(value);
    }

    /**
     * 
     * @param value 
     */
    public updateExternal(value: string): void {
        this._update(value);
    }

    /**
     * 
     * @returns 
     */
    public getFieldName(): string {
        return this._fieldName;
    }
}