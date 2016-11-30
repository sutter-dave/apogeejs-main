/** This namespace contains some basic functions for the application. */
hax.base = {};

/** This method creates an integer has value for a string. */
hax.base.mixin = function(destObject,mixinObject) {
    for(var key in mixinObject) {
        destObject.prototype[key] = mixinObject[key];
    }
}

/** This method takes a field which can be an object, 
 *array or other value. If it is an object or array it 
 *freezes that object and all of its children, recursively. */
hax.base.deepFreeze = function(field) {
    if((field === null)||(field === undefined)) return;
    
    var type = hax.util.getObjectType(field);
	var i;
	if(type == "Object") {
		Object.freeze(field);
		for(i in field) {
			hax.base.deepFreeze(field[i]);
		}
	}
	else if(type == "Array") {
		Object.freeze(field);
		for(i = 0; i < field.length; i++) {
			hax.base.deepFreeze(field[i]);
		}
	}
}

/** This method creates an error object, which has a "message" in the format
 *of a system error. The isFatal flag can be set to specify if this is a fatal or nonfatal
 *error. It may also be omitted. A base error may also be set. */
hax.base.createError = function(msg,optionalIsFatal,optionalBaseError) {
    var error = new Error(msg);
	if(optionalIsFatal !== undefined) {
		error.isFatal = optionalIsFatal;
	}
	if(optionalBaseError !== undefined) {
		error.baseError = optionalBaseError;
	}
    return error;
}

/** This creates a new array with elements from the first that are not in the second. 
 * I wasn't really sure where to put this. So it ended up here. */
hax.base.getListInFirstButNotSecond = function(firstList,secondList) {
    var newList = [];
    for(var i = 0; i < firstList.length; i++) {
        var entry = firstList[i];
        if(secondList.indexOf(entry) < 0) {
            newList.push(entry);
        }
    }
    return newList;
}