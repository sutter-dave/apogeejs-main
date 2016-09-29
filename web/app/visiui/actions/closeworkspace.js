

visicomp.app.visiui.closeworkspace = {};

//=====================================
// UI Entry Point
//=====================================

visicomp.app.visiui.closeworkspace.getCloseCallback = function(app) {
    return function() {

        var actionResponse = visicomp.app.visiui.closeworkspace.closeWorkspace(app); 
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}

//=====================================
// Action
//=====================================

visicomp.app.visiui.closeworkspace.closeWorkspace = function(app) {
    var actionResponse = new visicomp.core.ActionResponse();
    var workspaceUIRemoved = false;
    
    try {
    
        var activeWorkspaceUI = app.getActiveWorkspaceUI();
        if(activeWorkspaceUI === null) {
            var errorMsg = "There is no workspace open.";
            var actionError = new visicomp.core.ActionError(errorMsg,"User",null);
            actionResponse.addError(actionError);
            return actionResponse;
        }

        var workspace = activeWorkspaceUI.getWorkspace();
        
        var name = workspace.getName();
        
        var doRemove = confirm("Are you sure you want to close the workspace " + name + "?");
        if(!doRemove) {
            return actionResponse;
        }
        
        workspaceUIRemoved = app.removeWorkspaceUI(name);
        
        activeWorkspaceUI.close();
        workspace.close();
    }
    catch(error) {
        var isFatal = !workspaceUIRemoved;
        var actionError = visicomp.core.ActionError.processException(error,"AppException",isFatal);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}




