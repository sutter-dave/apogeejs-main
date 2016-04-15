
visicomp.app.visiui.ResourceOutputMode = function(component) {
	this.component = component;
	
	this.outputElement = visicomp.visiui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
}

/** This indicates if this element displays data or something else (code) */
visicomp.app.visiui.ResourceOutputMode.prototype.isData = true;

visicomp.app.visiui.ResourceOutputMode.prototype.getElement = function() {
	return this.outputElement;
}
	
visicomp.app.visiui.ResourceOutputMode.prototype.showData = function(editOk) {
	//edit ok ignored - no edit of the control data object - there is none
	
	var control = this.component.getObject();
    var resource = control.getResource();
    if((resource)&&(resource.run)) {
        resource.run();
    }   
}

visicomp.app.visiui.ResourceOutputMode.prototype.destroy = function() {
}

//==============================
// internal
//==============================

visicomp.app.visiui.ResourceOutputMode.prototype.onSave = function(data) {
	//no saving action
}

