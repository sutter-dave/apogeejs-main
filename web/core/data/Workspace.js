/** This is the workspace. */
visicomp.core.Workspace = function(name,eventManager) {
    this.name = name;
    this.rootPackage = null;
    this.eventManager = eventManager;
    
    //add an entry in the update code structure
    visicomp.core.functionCode[name] = {};
}

/** this method gets the workspace name. */
visicomp.core.Workspace.prototype.getName = function() {
    return this.name;
}

/** this method gets the workspace name. */
visicomp.core.Workspace.prototype.getType = function() {
    return "workspace";
}

/** this method gets the context command. */
visicomp.core.Workspace.prototype.getEventManager = function() {
    return this.eventManager;
}

/** this method gets the root packaage for the workspace. */
visicomp.core.Workspace.prototype.getRootPackage = function() {
    return this.rootPackage;
}

/** this method gets the root packaage for the workspace.
 * @private */
visicomp.core.Workspace.prototype.setRootPackage = function(package) {
    this.rootPackage = package;
    package.setParent(this);
    package.setIsRootPackage(true);
}
