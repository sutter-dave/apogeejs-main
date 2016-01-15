/** This class encapsulatees a data table */
visicomp.core.Resource = function(parent,name) {
    //base init
    visicomp.core.Impactor.init.call(this);
    visicomp.core.Child.init.call(this,parent,name,visicomp.core.Resource.generator);
    visicomp.core.DataHolder.init.call(this);
    visicomp.core.Dependant.init.call(this);
	visicomp.core.Codeable.init.call(this,["resource"]);
    
    this.resourceProcessor = null;
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Resource,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.Resource,visicomp.core.Dependant);
visicomp.core.util.mixin(visicomp.core.Resource,visicomp.core.Codeable);
visicomp.core.util.mixin(visicomp.core.Resource,visicomp.core.Recalculable);
	
visicomp.core.Resource.prototype.getResourceProcessor = function() {	
    return this.resourceProcessor;
}    

/** This method updates the resource processor for this resource. */
visicomp.core.Resource.prototype.updateResourceProcessor = function(resourceProcessor) {	
    this.resourceProcessor = resourceProcessor;
	
    //re-execute, if needed
	if(this.needsExecuting()) {
        this.execute();
    }
} 

visicomp.core.Resource.prototype.processObjectFunction = function(objectFunction) {	
    //exectue the object function passing the resource object.
    if(this.resourceProcessor) {
        objectFunction(this.resourceProcessor);
    }
}

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
visicomp.core.Resource.fromJson = function(parent,json,updateDataList) {
    
    var resource = new visicomp.core.Resource(parent,json.name);
    if(json.updateData) {
        json.updateData.member = resource;
        updateDataList.push(json.updateData);
    }
    return resource;
}

//===================================
// Protected Functions
//===================================

//============================
// Static methods
//============================

visicomp.core.Resource.generator = {};
visicomp.core.Resource.generator.displayName = "Resource";
visicomp.core.Resource.generator.type = "visicomp.core.Resource";
visicomp.core.Resource.generator.createMember = visicomp.core.Resource.fromJson;

//register this member
visicomp.core.Workspace.addMemberGenerator(visicomp.core.Resource.generator);




