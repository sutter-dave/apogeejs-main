/** This class manages the user interface for a workspace object. The argument
 * uiInitData is optional and should be included if the workspace is not empty. It
 * contains the information of how to create controls for the workspace data. */
visicomp.app.visiui.WorkspaceUI = function(app,tab) {
//note - this is not the correct event manager
var wrongEventManager = app;
    visicomp.app.visiui.ParentContainer.init.call(this,tab,wrongEventManager);
    
    //properties
	this.app = app;
    this.tab = tab;
    this.controlMap = {};
    this.activeFolderName = null;
   
    this.jsLinkArray = [];
    this.cssLinkArray = [];
}
    

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.WorkspaceUI,visicomp.app.visiui.ParentContainer);

visicomp.app.visiui.WorkspaceUI.prototype.loadWorkspace = function(workspaceJson) {
    var workspaceDataJson = workspaceJson.workspace;
    var workspaceControlsJson = workspaceJson.controls;
    
    var workspace = visicomp.core.Workspace.fromJson(workspaceDataJson);
    
    this.setWorkspace(workspace,workspaceControlsJson);
}

visicomp.app.visiui.WorkspaceUI.prototype.loadNewWorkspace = function(name) {
    var workspace = new visicomp.core.Workspace(name);
    
    this.setWorkspace(workspace);
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.getWorkspace = function() {
    return this.workspace;
}

/** This method gets the control associated with a member object. */
visicomp.app.visiui.WorkspaceUI.prototype.getControl = function(object) {
    var key = this.getObjectKey(object);
	var controlInfo = this.controlMap[key];
	if(controlInfo) {
		return controlInfo.control;
	}
	else {
		return null;
	}
}

/** This returns the map of control objects. */
visicomp.app.visiui.WorkspaceUI.prototype.getControlMap = function() {
	return this.controlMap;
}

visicomp.app.visiui.WorkspaceUI.prototype.getParentContainerObject = function(object) {
    var parent = object.getParent();
    
    //get parent control info
    var parentKey = this.getObjectKey(parent);
    var parentControlInfo = this.controlMap[parentKey];
    if(!parentControlInfo.parentContainer) {
        throw visicomp.core.util.createError("Parent container not found!");
    }
    return parentControlInfo.parentContainer;
}

/** This method registers a member data object and its optional control object.
 * for each folder, and only folders at this point, the mehod addControlContainer
 * should also be called to set the container for the children of this folder. */
visicomp.app.visiui.WorkspaceUI.prototype.registerMember = function(object,control) {
    
    //make sure this is for us
    if(object.getWorkspace() !== this.workspace) {
        throw visicomp.core.util.createError("Control registered in wrong workspace: " + object.getFullName());
    }
    
    //store the ui object
	var key = this.getObjectKey(object);
	
	if(this.controlMap[key]) {
		alert("Unknown error - there is already an object with this object key: " + key);
		return;
	}
	
    var controlInfo = {};
    controlInfo.object = object;
	controlInfo.control = control;
	
    this.controlMap[key] = controlInfo;
    
}

/** This method registers a control. The parameter "parentContainer" is optional
 * and is only needed if the object is a parent container. */
visicomp.app.visiui.WorkspaceUI.prototype.addControlContainer = function(object,parentContainer) {
    
    //store the ui object
	var key = this.getObjectKey(object);
	
    var controlInfo = this.controlMap[key];
    if(!controlInfo) {
		alert("Unknown error - control info not found: " + key);
		return;
	}
	controlInfo.parentContainer = parentContainer;
}
	

/** This method responds to a member updated. */
visicomp.app.visiui.WorkspaceUI.prototype.memberUpdated = function(memberObject) {
    //store the ui object
	var key = memberObject.getFullName();
	
	var controlInfo = this.controlMap[key];
	if((controlInfo)&&(controlInfo.control)) {
        controlInfo.control.memberUpdated();
    }
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.WorkspaceUI.prototype.childDeleted = function(fullName) {
	
	//store the ui object
	var key = fullName;
	
	var controlInfo = this.controlMap[key];
	delete this.controlMap[key];

	if((controlInfo)&&(controlInfo.control)) {
        //remove the UI element
        var controlWindow = controlInfo.control.getWindow();
        controlWindow.remove();
        
        //do any needed cleanup
        controlInfo.control.onDelete();
	}
}

visicomp.app.visiui.WorkspaceUI.prototype.getObjectKey = function(object) {
//needs to be changed when we add worksheets
	return object.getFullName();
}

//====================================
// open and save methods
//====================================

visicomp.app.visiui.WorkspaceUI.prototype.toJson = function() {
    var json = {};
    json.name = this.workspace.getName();
    json.fileType = "visicomp workspace";
    
    json.jsLinks = this.jsLinkArray;
    json.cssLinks = this.cssLinkArray;
    
    json.workspace = this.workspace.toJson();
    
    var rootFolder = this.workspace.getRootFolder();
    json.controls = this.getFolderControlContentJson(rootFolder);
    
    return json;
}

visicomp.app.visiui.WorkspaceUI.prototype.getFolderControlContentJson = function(folder) {
    var json = {};
    var childMap = folder.getChildMap();
	for(var key in childMap) {
		var child = childMap[key];
        
		//get the object map for the workspace
		var childControl = this.getControl(child);
		
		//get the control for this child
		var name = child.getName();
		json[name] = childControl.toJson();
	}
    return json;
}


///** This is used for saving the workspace. */
//visicomp.app.visiui.WorkspaceUI.fromJson = function(app, json) {
//    //check file
//    var name = json.name;
//    var fileType = json.fileType;
//	if((fileType !== "visicomp workspace")||(!name)) {
//		return {"success":false,"msg":"Bad file format."};
//	}
//    
//    //create the workspace
//    var returnValue = app.createWorkspace(name);
//    if(!returnValue.success) {
//        return returnValue;
//    }
//    
//    var workspaceUI = returnValue.workspaceUI;
//	var workspace = returnValue.workspace;
//    
//}

///** This is used for saving the workspace. */
//visicomp.app.visiui.WorkspaceUI.setWorkspaceDataFromJson = function(workspaceUI,workspace,json) {
//
//    var workspace = visicomp.core.Workspace.fromJson(json);
//
////what am I doing? ;
//
//    var controlInfoMap = json.ui;
//    
//    //construc the ui elements as the workspace members are created
//    var onMemberCreated = function(member) {
//        var control = null;
//        
//        var controlInfo = controlInfoMap[member.getFullName()];
//        if(controlInfo) {
//            control = visicomp.app.visiui.WorkspaceUI.createControl(workspaceUI,member,controlInfo);
//        }
//        
//        workspaceUI.registerMember(member,control);
//    }
//    workspace.addListener(visicomp.core.createmember.MEMBER_CREATED_EVENT,onMemberCreated);
//    workspace.loadFromJson(json.workspace);
//    
//	
//	//create children
//	var rootFolder = workspace.getRootFolder();
//	var childrenJson = json.data;
//	var updateDataList = [];
//	
//	workspaceUI.createChildrenFromJson(rootFolder,childrenJson,updateDataList)
//    
//    //set the data on all the objects
//    var result;
//    if(updateDataList.length > 0) {
//        result = visicomp.core.updatemember.updateObjects(updateDataList);
//            
//        if(!result.success) {
//            return result;
//        }
//    }
//    
////figure out a better return
//	return {"success":true};
//}

///** This serializes the child controls for this fodler. */
//visicomp.app.visiui.WorkspaceUI.prototype.createChildrenFromJson = function(parentFolder,json,updateDataList) {
//	for(var key in json) {
//		var childJson = json[key];
//        var type = childJson.type;
//        var controlGenerator = this.app.getControlGenerator(type);
//        if(!controlGenerator) {
//            throw visicomp.core.util.createError("Control definition not found: " + type);
//        }
//        visicomp.app.visiui.Control.createfromJson(this,parentFolder,controlGenerator,childJson,updateDataList);
//	}
//}
//
///** This serializes the child controls for this fodler. */
//visicomp.app.visiui.WorkspaceUI.prototype.addChildrenToJson = function(folder,json) {
//	
//	var childMap = folder.getChildMap();
//	for(var key in childMap) {
//		var child = childMap[key];
//        
//		//get the object map for the workspace
//		var childControl = this.getControl(child);
//		
//		//get the control for this child
//		var name = child.getName();
//		json[name] = childControl.toJson(this);
//	}
//}


 /** This method responds to a "new" menu event. 
  * @private */
visicomp.app.visiui.WorkspaceUI.prototype.setWorkspace = function(workspace,workspaceControlsJson) {   
    
    this.workspace = workspace;
	
    //listeners
    var instance = this;
    
    //add a member updated listener
    var memberUpdatedCallback = function(memberObject) {
        instance.memberUpdated(memberObject);
    }
    workspace.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, memberUpdatedCallback);
	
	//add child deleted listener
    var childDeletedListener = function(fullName) {
        instance.childDeleted(fullName);
    }
    this.workspace.addListener(visicomp.core.deletechild.CHILD_DELETED_EVENT, childDeletedListener);
    
    //set up root folder
    var rootFolder = workspace.getRootFolder();
    this.registerMember(rootFolder,null);
    this.addControlContainer(rootFolder,this)
    
    //oad contrtols from json if present
    if(workspaceControlsJson) {
        this.loadFolderControlContentFromJson(rootFolder,workspaceControlsJson);
    }
    
}

visicomp.app.visiui.WorkspaceUI.prototype.loadFolderControlContentFromJson = function(folder,json) {
	for(var key in json) {
		var childJson = json[key];
		var childMember = folder.lookupChild(key);	
		this.loadControlFromJson(childMember,childJson);
	}
}

visicomp.app.visiui.WorkspaceUI.prototype.loadControlFromJson = function(member,json) {
    var controlType = json.type;
    var generator = this.app.getControlGenerator(controlType);
	if(generator) {
        generator.createControlFromJson(this,member,json);
    }
    else {
        throw visicomp.core.util.createError("Control type not found: " + controlType);
    }
}


//========================================
// Links
//========================================

visicomp.app.visiui.WorkspaceUI.prototype.getJsLinks = function() {
	return this.jsLinkArray;
}

visicomp.app.visiui.WorkspaceUI.prototype.setJsLinks = function(newLinkArray) {
    //update the page links
    var oldLinkArray = this.jsLinkArray;
	var addList = [];
	var removeList = [];
    this.createLinkAddRemoveList(newLinkArray,oldLinkArray,addList,removeList);
    this.jsLinkArray = newLinkArray;
	this.app.updateWorkspaceLinks(this.workspace.getName(),addList,removeList,"js");;
}

visicomp.app.visiui.WorkspaceUI.prototype.getCssLinks = function() {
	return this.cssLinkArray;
}

visicomp.app.visiui.WorkspaceUI.prototype.setCssLinks = function(newLinkArray) {
    //update the page links
    var oldLinkArray = this.cssLinkArray;
	var addList = [];
	var removeList = [];
    this.createLinkAddRemoveList(newLinkArray,oldLinkArray,addList,removeList);
    this.cssLinkArray = newLinkArray;
	this.app.updateWorkspaceLinks(this.workspace.getName(),addList,removeList,"css");
}

/** This method determins which links are new, which are old and which are removed.  
 * @private */
visicomp.app.visiui.WorkspaceUI.prototype.createLinkAddRemoveList = function(linkArray,oldLinkArray,addList,removeList) { 
    
    var newLinks = {};
    var i;
    var link;
    
    //add the new links
    for(i = 0; i < linkArray.length; i++) {
        link = linkArray[i];
        newLinks[link] = true;
    }
    
    //fiure out which are new and which are outdated
    for(i = 0; i < oldLinkArray.length; i++) {
        link = oldLinkArray[i];
        if(!newLinks[link]) {
			//this link has been removed
            removeList.push(link);
        }
		else {
			//flag that this does not need to be added
			newLinks[link] = false;
		}
    }
	
	//put the new links to the add list
	for(link in newLinks) {
		if(newLinks[link]) {
			addList.push(link);
		}
	}
}
    