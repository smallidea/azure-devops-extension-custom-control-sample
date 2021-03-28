//import { Control } from "customControl";
import * as ExtensionContracts from "TFS/WorkItemTracking/ExtensionContracts";

//var control: Control;

var provider = () => {
    return {
        // 加载时
        onLoaded: (workItemLoadedArgs: ExtensionContracts.IWorkItemLoadedArgs) => {
            // create the control
            //var fieldName = VSS.getConfiguration().witInputs["FieldName"];
            //var colors = VSS.getConfiguration().witInputs["Colors"];
            //control = new Control(fieldName, colors);

        },
        // 当绑定字段的值改变时
        onFieldChanged: (fieldChangedArgs: ExtensionContracts.IWorkItemFieldChangedArgs) => {
            /* var changedValue = fieldChangedArgs.changedFields[control.getFieldName()];
            if (changedValue !== undefined) {
                //control.updateExternal(changedValue);
            } */
        }
    }
};

VSS.register(VSS.getContribution().id, provider);