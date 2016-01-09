/** This is a worksheet, which is basically a function
 * that is expanded into data objects. */
visicomp.core.Worksheet = function(workspace,name,parent) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"worksheet");
    visicomp.core.DataHolder.init.call(this);
    visicomp.core.Dependant.init.call(this);
    visicomp.core.Impactor.init.call(this);
    visicomp.core.Recalculable.init.call(this);
    
    //we need to add to parent here, since we use the path for the interanl folder
    parent.addChild(this);
    
    //create the internal folder as a root folder (no parent). But give it
    //the full path name
    this.internalFolder = new visicomp.core.Folder(workspace,this.getFullName());
    
    this.returnValueString = "";
    this.argList = [];
    
    //dummy, until we figure out how to do this
    this.setData(function(){return 111;});
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.Child);

//add components to this class
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.DataHolder);
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.Dependant);
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.Impactor);
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.Recalculable);

/** */
visicomp.core.Worksheet.prototype.getInternalFolder = function() {
    return this.internalFolder;
}

// SET REUTRN VALUE NEEDS TO HAVE THE FULL UPDATE LOGIC!!!!

/** */
visicomp.core.Worksheet.prototype.setReturnValueString = function(returnValueString) {
    this.returnValueString = returnValueString;
}

/** */
visicomp.core.Worksheet.prototype.getReturnValueString = function() {
    return this.returnValueString;
}

/** */
visicomp.core.Worksheet.prototype.setArgList = function(argList) {
    this.argList = argList;
}

/** */
visicomp.core.Worksheet.prototype.getArgList = function() {
    return this.argList;
}

/** This method is called when the child is deleted. If necessary the implementation
 * can extend this function, but it should call this base version of the function
 * if it does.  */
visicomp.core.Worksheet.prototype.onDelete = function() {
    
    var returnValue;
    
    if(this.internalFolder) {
        returnValue = visicomp.core.deletechild.deleteChild(this.internalFolder);
    }
    
//I don't know what to do if this fails. Figure that out.
    
    //call the base delete
    returnValue = visicomp.core.Child.onDelete.call(this);
	return returnValue;
}