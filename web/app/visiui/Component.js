/** This is a mixin that encapsulates the base functionality of a Component
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.app.visiui.Component = {};
    
/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
visicomp.app.visiui.Component.init = function(workspaceUI,object,generator,options) {
    
    if(!options) {
        options = {};
    }
    
    this.workspaceUI = workspaceUI;
    this.object = object;
    this.generator = generator;
    
    this.parentContainer = this.workspaceUI.getParentContainerObject(object);
    if(!this.parentContainer) {
        throw visicomp.core.util.createError("Parent object not found: " + object.getFullName());
    }
    
    this.workspaceUI.registerMember(this.object,this);
    
    //--------------
    //create window
    //--------------
    var windowOptions = {};
    windowOptions.minimizable = true;
    windowOptions.maximizable = true;
    windowOptions.resizable = true;
    windowOptions.movable = true;
    this.window = new visicomp.visiui.WindowFrame(this.parentContainer,windowOptions);

    //------------------
    // Add menu (we will add the items later. This populates it.)
    //------------------

    var menu = this.window.getMenu();
    
    //------------------
    //set the title
    //------------------
    this.window.setTitle(this.getObject().getDisplayName());
    
    //show the window
    if(options.coordInfo) {
        this.window.setCoordinateInfo(options.coordInfo);
    }
    else {
        //set position 
        var pos = this.parentContainer.getNextWindowPosition();
        this.window.setPosition(pos[0],pos[1]);
        
        //set default size
        this.window.setSize(generator.DEFAULT_WIDTH,generator.DEFAULT_HEIGHT);
    }
    if(options.windowState) {
        this.window.setWindowState(options.windowState);
    }
    this.window.show();
    
    
    //------------------
    // Add window content
    //------------------
    
    //menu items
    this.menuItemInfoList = [];
    
    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Delete " + this.generator.displayName;
    itemInfo.callback = this.createDeleteCallback(itemInfo.title);
    this.menuItemInfoList.push(itemInfo);
    
    //let the extending object populate the frame and the menu items
	if(this.populateFrame) {
		this.populateFrame();
	}
    
    //set the menu items
    menu.setMenuItems(this.menuItemInfoList);
}

//=======================
// dev
//=======================

/** This method returns the base member for this component. */
visicomp.app.visiui.Component.showErrorBar = function(text) {
    if(!this.errorDiv) {
        this.errorDiv = visicomp.visiui.createElement("div",null,
            {
                "display":"block",
                "position":"relative",
                "top":"0px",
                "background-color":"red",
                "color":"white"
            });
    }
    this.errorDiv.innerHTML = text;
    this.errorBarActive = true;
	
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
visicomp.app.visiui.Component.hideErrorBar = function() {
	this.errorBarActive = false;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
visicomp.app.visiui.Component.showSaveBar = function(onSave,onCancel) {
    if(!this.saveDiv) {
        this.saveDiv = visicomp.visiui.createElement("div",null,
            {
                "display":"block",
                "position":"relative",
                "top":"0px",
                "background-color":"white",
				"border":"solid 1px gray",
				"padding":"3px"
            });
			
		this.saveDiv.appendChild(document.createTextNode("Edit: "));
		
		this.saveBarSaveButton = document.createElement("button");
		this.saveBarSaveButton.innerHTML = "Save";
		this.saveDiv.appendChild(this.saveBarSaveButton);
		
		this.saveDiv.appendChild(document.createTextNode(" "));

		this.saveBarCancelButton = document.createElement("button");
		this.saveBarCancelButton.innerHTML = "Cancel";
		this.saveDiv.appendChild(this.saveBarCancelButton);
    }
	
	this.saveBarSaveButton.onclick = onSave;
	this.saveBarCancelButton.onclick = onCancel;
	this.saveBarActive = true;
	
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
visicomp.app.visiui.Component.hideSaveBar = function() {
    this.saveBarActive = false;	
	this.showActiveHeaders();
}

/** This method shows the active headers. 
 * @private */
visicomp.app.visiui.Component.showActiveHeaders = function() {
	var window = this.getWindow();
	
	var headers = [];
	if((this.errorBarActive)&&(this.errorDiv)) {
		headers.push(this.errorDiv);
	}
	if((this.saveBarActive)&&(this.saveDiv)) {
		headers.push(this.saveDiv);
	}
	
    window.loadHeaders(headers);
}

//==============================
// Public Instance Methods
//==============================

/** This method returns the base member for this component. */
visicomp.app.visiui.Component.getObject = function() {
    return this.object;
}

/** This method returns the workspace for this component. */
visicomp.app.visiui.Component.getWorkspace = function() {
    return this.object.getWorkspace();
}

/** This method returns the workspaceUI for this component. */
visicomp.app.visiui.Component.getWorkspaceUI = function() {
    return this.workspaceUI;
}

/** This method populates the frame for this component. */
visicomp.app.visiui.Component.getWindow = function() {
     return this.window;
}

/** This method sets the content element as a scrolling element. */
visicomp.app.visiui.Component.setScrollingContentElement = function() {
    //load the content div
    this.contentDiv = visicomp.visiui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
    this.window.setContent(this.contentDiv);
}

/** This method sets the content element as a fixed element. */
visicomp.app.visiui.Component.setFixedContentElement = function() {
    //load the content div
    this.contentDiv = this.window.getBody();
}

/** This method returns the content element for the windowframe for this component. */
visicomp.app.visiui.Component.getContentElement = function() {
     return this.contentDiv;
}

/** This serializes the component. */
visicomp.app.visiui.Component.toJson = function() {
    var json = {};
    json.key = this.getObject().getFullName();
    json.type = this.generator.uniqueName;
    
    json.coordInfo = this.window.getCoordinateInfo();
    json.windowState = this.window.getWindowState();
    
    if(this.writeToJson) {
        this.writeToJson(json);
    }
    
    return json;
}

//==============================
// Protected Instance Methods
//==============================

/** This method returns the menu entries for this component. */
visicomp.app.visiui.Component.getMenuItemInfoList = function() {
    return this.menuItemInfoList;
}

//This method should be populated by an extending object. It should return a json object.
//** This serializes the table component. */
//visicomp.app.visiui.Component.prototype.writeToJson = function(json);

//This method should be populated by an extending object.
//** This method populates the frame for this component. */
//visicomp.app.visiui.Component.populateFrame = function();

/** This method should include an needed functionality to clean up after a delete. */
visicomp.app.visiui.Component.onDelete = function() {
}

//=============================
// Action UI Entry Points
//=============================

/** This method creates a callback for editing a standard codeable object
 *  @private */
visicomp.app.visiui.Component.createEditCodeableDialogCallback = function(title, optionalEditorWrapper) {
	var instance = this;
    var member = instance.getObject();
    
    //create save handler
    var onSave = function(functionBody,supplementalCode) {
        var argList = member.getArgList();
        var actionResponse =  visicomp.core.updatemember.updateCode(member,argList,functionBody,supplementalCode);
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
        
        //return true to close the dialog
        return true;  
    };
    
    return function() {
        visicomp.app.visiui.dialog.showUpdateCodeableDialog(instance.object,onSave,title,optionalEditorWrapper);
    }
}

/** This method creates a callback for deleting the component. 
 *  @private */
visicomp.app.visiui.Component.createDeleteCallback = function(title) {
    var object = this.getObject();
    return function() {
        //we should do a warning!!!
        
        //delete the object - the component we be deleted after the delete event received
        var actionResponse = visicomp.core.deletemember.deleteMember(object);
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
    }
}

//======================================
// All components should have a generator to register the component, as below
//======================================
//
//visicomp.app.visiui.JsonTableComponent.generator = {};
//visicomp.app.visiui.JsonTableComponent.generator.displayName = "JSON Table";
//visicomp.app.visiui.JsonTableComponent.generator.uniqueName = "visicomp.app.visiui.JsonTableComponent";
//visicomp.app.visiui.JsonTableComponent.generator.createComponent = visicomp.app.visiui.JsonTableComponent.createComponent;
//visicomp.app.visiui.JsonTableComponent.generator.createComponentFromJson = visicomp.app.visiui.JsonTableComponent.createComponentFromJson;
//visicomp.app.visiui.JsonTableComponent.generator.DEFAULT_WIDTH = 200;
//visicomp.app.visiui.JsonTableComponent.generator.DEFAULT_HEIGHT = 200;