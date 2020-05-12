import {addActionInfo} from "/apogee/actions/action.js";
import Model from "/apogee/data/Model.js";

/** This is self installing command module. This must be imported to install the command.
 * Note that this module also contains an export, unlike most command modules. 
 * The export us used so other actions can load child members. 
 *
 * Action Data format:
 * {
 *  "action": "createMember",
 *  "parentId": (parent for new member),
 *  "name": (name of the new member),
 *  "createData": 
 *      - name
 *      - unique table type name
 *      - additional table specific data
 *  
 * }
 *
 * MEMBER CREATED EVENT: "created"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */


/** This is the action function to create a member. 
 * @private */
function createMemberAction(model,actionData) {
    
    let parent;
    if(actionData.modelIsParent) {
        //the parent is the model (It should already be mutable)
        parent = model;
    }
    else {
        //get the parent, as a new mutable instance
        parent = model.getMutableMember(actionData.parentId);

        if(!parent) {
            let actionResult = {};
            actionResult.actionDone = false;
            actionResult.errorMsg = "Parent not found for created member";
            return actionResult;
        }
    }

    let memberJson = actionData.createData;
    let actionResult = createMember(model,parent,memberJson);
    return actionResult;
}

/** This function creates a member and any children for that member, returning an action result for
 * the member. This is exported so create member can be used by other actions, such as load model. */
export function createMember(model,parent,memberJson) {

    let member;
    let actionResult = {};
    actionResult.event = ACTION_EVENT;
    
    //create member
    let generator;
    if(memberJson) {
        generator = Model.getMemberGenerator(memberJson.type);
    }

    if(generator) {
        member = generator.createMember(parent.getId(),memberJson); 

        //pass this child to the parent
        parent.addChild(model,member);

        //register member with model
        model.registerMember(member);

        //set action flags for successfull new member
        actionResult.updateModelDependencies = true;
        if((member.hasCode)&&(member.hasCode())) {
            actionResult.recalculateMember = true;
        }
        else {
            actionResult.recalculateDependsOnMembers = true;
        }

        //instantiate children if there are any
        if(memberJson.children) {
            actionResult.childActionResults = [];
            for(let childName in memberJson.children) {
                let childJson = memberJson.children[childName];
                let childActionResult = createMember(model,member,childJson);
                actionResult.childActionResults.push(childActionResult);
            }
        }
    }
    else {
        //type not found! - create a dummy object and add an error to it
        let errorTableGenerator = Model.getMemberGenerator("apogee.ErrorMember");
        member = errorTableGenerator.createMember(parent,memberJson);
        member.setError("Member type not found: " + memberJson.type);
        
        //store an error message, but this still counts as command done.
        actionResult.errorMsg = "Error creating member: member type not found: " + memberJson.type;
    }

    actionResult.member = member;
    actionResult.actionDone = true;

    return actionResult;
}

let ACTION_EVENT = "created";

//This line of code registers the action 
addActionInfo("createMember",createMemberAction);