/** This is the workspace. */
visicomp.core.Workspace = function(name) {
    //base init
    visicomp.core.EventManager.init.call(this);
    
    this.name = name;
    
    //initialize business logic handlers
    visicomp.core.createfolder.initHandler(this);
    visicomp.core.createtable.initHandler(this);
    visicomp.core.createfunction.initHandler(this);
    visicomp.core.createcontrol.initHandler(this);
    visicomp.core.updatemember.initHandler(this);
    visicomp.core.updatecontrol.initHandler(this);
    visicomp.core.deletechild.initHandler (this);

    //add the root folder
	this.rootFolder = new visicomp.core.Folder(this,name);
    
    //add an entry in the update code structure
    visicomp.core.functionCode[name] = {};
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Workspace,visicomp.core.EventManager);

/** this method gets the workspace name. */
visicomp.core.Workspace.prototype.getName = function() {
    return this.name;
}

/** this method gets the workspace name. */
visicomp.core.Workspace.prototype.getType = function() {
    return "workspace";
}

/** this method gets the root packaage for the workspace. */
visicomp.core.Workspace.prototype.getRootFolder = function() {
    return this.rootFolder;
}