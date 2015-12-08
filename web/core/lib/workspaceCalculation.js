/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
visicomp.core.calculation = {};


visicomp.core.calculation.fireUpdatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(visicomp.core.calculation.MEMBER_UPDATED_EVENT,member);
}


/** This addes the member to the recalculate list, if it has a formula and hence
 * needs to be recalculated. It then adds all talbes that depend on this one.
 * @private */
visicomp.core.calculation.addToRecalculateList = function(recalculateList,member) {
    //if it is in the list, return
    if(this.inList(recalculateList,member)) return;
     
    //add this member to recalculate list if it needs to be executed
    if(member.needsExecuting()) {
       recalculateList.push(member);
    }
    //add any member that is depends on this one
    var impactsList = member.getImpactsList();
    for(var i = 0; i < impactsList.length; i++) {
        visicomp.core.calculation.addToRecalculateList(recalculateList,impactsList[i]);
    }
}

/** This method recalculates all member objects in the given root folder. */
visicomp.core.calculation.recalculateAll = function(rootFolder) {	
	var recalculateList = [];
	//add all members, recursively
	visicomp.core.calculation.addAll(rootFolder,recalculateList);
	//recalculate
	visicomp.core.calculation.recalculateObjects(recalculateList);
}

/** This method recursively adds all members from the given folder and this children. */
visicomp.core.calculation.addAll = function(folder,recalculateList) {
	var childMap = folder.getChildMap();
	for(var key in childMap) {
		var child = childMap[key];
		switch(child.getType()) {
			case "folder":
				visicomp.core.calculation.addAll(folder,recalculateList);
				break;
			
			case "table":
			case "function":
				recalculateList.push(child);
//I think we need to recalculate code! (because of the dependencies)
				break;
				
			default:
				break;
		}
	}
}

/** This method places the member in the recalculate list, but only if the member is 
 * not already there. 
 *  @private */
visicomp.core.calculation.inList = function(recalculateList,member) {
    for(var j = 0; j < recalculateList.length; j++) {
        var testObject = recalculateList[j];
        if(testObject == member) {
            return true;
        }
    }
    return false;
}
    

/** This method sorts the recalcultae list into the proper order and then
 * recalculates all the members in it. */
visicomp.core.calculation.recalculateObjects = function(recalculateList) {
	
    //sort the list so we can update once each
    var success = visicomp.core.calculation.sortRecalculateList(recalculateList);
    if(!success) return;
	
    //update each of the items in this list
    visicomp.core.calculation.callRecalculateList(recalculateList);
}

/** This method updates the recalculate list order so no member appears in the list
 *before a member it depends on. This will return false if it fails. 
 * @private */
visicomp.core.calculation.sortRecalculateList = function(recalculateList) {
	
	//working variables
	var sortedRecalculateList = [];
	var member;
	var i;
	
	//keep track of which members have been copied to the sorted list
	var memberIsSortedMap = {};
	for(i = 0; i < recalculateList.length; i++) {
		member = recalculateList[i];
		memberIsSortedMap[member.getFullName()] = false;
	}
	
	//sort the list
	while(recalculateList.length > 0) {
		//this is to check if we did anything this iteration
		var membersAddedToSorted = false;
		
		//cycle through the member list. A member can be copied to the sorted
		//list once it has no dependencies that have not yet been copied, or in 
		//other words, it has no depedencies that have not been updated yet.
		for(i = 0; i < recalculateList.length; i++) {
			//cyucle through members
			member = recalculateList[i];
			
			//check if there are any unsorted dependencies
			var unsortedImpactedDependencies = false;
			var dependsOn = member.getDependsOn();
			for(var j = 0; j < dependsOn.length; j++) {
				var remoteObject = dependsOn[j];
				if(memberIsSortedMap[remoteObject.getFullName()] === false) {
					//this depends on an unsorted member
					unsortedImpactedDependencies = true;
					break;
				}
			}
			
			//save member to sorted if there are no unsorted impacted dependencies
			if(!unsortedImpactedDependencies) {
				//add to the end of the sorted list
				sortedRecalculateList.push(member);
				//record that is has been sorted
				memberIsSortedMap[member.getFullName()] = true;
				//remove it from unsorted list
				recalculateList.splice(i,1);
				//flag that we moved a member this iteration of while loop
				membersAddedToSorted = true;
			}
		}
		
		//if we added no members to sorted this iteration, there must be a circular reference
		if(!membersAddedToSorted) {
			alert("failure in update cascade - Is there a curcular reference?");
            return false;
		}
		
	}
	
	//copy working sorted list back to input list member
	for(i = 0; i < sortedRecalculateList.length; i++) {
		recalculateList.push(sortedRecalculateList[i]);
	}
	
	return true;
	
}

/** This calls the update method for each member in the impacted list.
 * @private */
visicomp.core.calculation.callRecalculateList = function(recalculateList) {
    var member;
    for(var i = 0; i < recalculateList.length; i++) {
        member = recalculateList[i];

        //update the member
        member.execute();

        //fire this for the change in value
        visicomp.core.calculation.fireUpdatedEvent(member);
    }
}








