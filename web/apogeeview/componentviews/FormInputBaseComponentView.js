import ComponentView from "/apogeeview/componentdisplay/ComponentView.js";
import AceTextEditor from "/apogeeview/datadisplay/AceTextEditor.js";
import ConfigurableFormEditor from "/apogeeview/datadisplay/ConfigurableFormEditor.js";
import { getFormResultFunctionBody } from "/apogeeui/apogeeUiLib.js";

/** This is a graphing component using ChartJS. It consists of a single data table that is set to
 * hold the generated chart data. The input is configured with a form, which gives multiple options
 * for how to set the data. */
export default class FormInputBaseComponentView extends ComponentView {

    constructor(modelView,component) {
        super(modelView,component);
    }

    /* The banner error message is overridden to show errors from the child members rather than from the 
     * containing folder, which would just be dependency errors. */
    getBannerErrorMessage(member) {
        let msgList = [];

        //we will ust print error messages from each internal components that can have errors
        let dataMember = this.getComponent().getField("member.data");
        if(dataMember.getState() == apogeeutil.STATE_ERROR) {
            msgList.push("data: " + dataMember.getErrorMsg());
        }
        let formResultMember = this.getComponent().getField("member.formResult");
        if(formResultMember.getState() == apogeeutil.STATE_ERROR) {
            msgList.push("configuration: " + formResultMember.getErrorMsg());
        }
        let formDataMember = this.getComponent().getField("member.formData");
        if(formDataMember.getState() == apogeeutil.STATE_ERROR) {
            msgList.push("configuration input: " + formDataMember.getErrorMsg());
        }

        return msgList.join(";\n");
    }

    getFormDataDisplay(displayContainer) {
        let dataDisplaySource = this._getInputFormDataSource();
        return new ConfigurableFormEditor(displayContainer,dataDisplaySource);
    }

    //=====================================
    // Private Methods
    //=====================================

    /** This is the data source for the input form data display */
    _getInputFormDataSource() {
        return {
            doUpdate: () => {
                //data updates should only be triggered by the form itself
                let reloadData = this.getComponent().isMemberDataUpdated("member.formData");
                //form layout constant
                let reloadDataDisplay = false;
                return {reloadData,reloadDataDisplay};
            }, 
            getDisplayData: () => this.getFormLayout(),
            getData: () => this.getComponent().getField("member.formData").getData(),
            getEditOk: () => true,
            saveData: (formData) => this._onSubmit(formData)
        }
    }

    /** This method saves the form result converted to a function body that handles expression inputs.
     * This is saved to the formula for the member object. */
    _onSubmit(formData) {
        //load the form meta - we have to look it up from the data display (this is a little clumsy)
        let formMeta;
        let formEditor = this.getCurrentDataDisplayInstance(CSVComponentView.VIEW_INPUT);
        if(formEditor) {
            formMeta = formEditor.getFormMeta();
        }

        if(!formMeta) {
            //data display should be present if the person submitted the form
            console.error("Unknown error loading the form meta value.");
            //return true indicates the submit is completed
            return true;
        }
        
        //get the function body
        let functionBody = getFormResultFunctionBody(formData,formMeta);

        //set the code
        var dataMember = this.getComponent().getField("member.formData");
        var resultMember = this.getComponent().getField("member.formResult");

        var dataCommand = {};
        dataCommand.type = "saveMemberData";
        dataCommand.memberId = dataMember.getId();
        dataCommand.data = formData;

        var resultCommand = {};
        resultCommand.type = "saveMemberCode";
        resultCommand.memberId = resultMember.getId();
        resultCommand.argList = [];
        resultCommand.functionBody = functionBody;
        resultCommand.supplementalCode = "";

        let command = {
            type: "compoundCommand",
            childCommands: [dataCommand,resultCommand]
        }
        
        let app = this.getModelView().getApp();
        app.executeCommand(command);

        //if we got this far the form save should be accepted
        return true;
    }       

}