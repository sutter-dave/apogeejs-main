import ConfigurableElement from "/apogeeui/configurablepanel/ConfigurableElement.js";
import apogeeui from "/apogeeui/apogeeui.js";

/** This is a heading element configurable element.
 * 
 * @class 
 */
export default class HeadingElement extends ConfigurableElement {

    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        var headingLevel;
        if(elementInitData.level) { 
            headingLevel = elementInitData.level;
        }
        else {
            headingLevel = HeadingElement.DEFAULT_HEADING_LEVEL;
        }
        var headingType = "h" + headingLevel;
        
        this.headingElement = apogeeui.createElement(headingType,{"className":"apogee_configurablePanelHeading","innerHTML":elementInitData.text});
        containerElement.appendChild(this.headingElement);
    }

    /** This method updates the data for the given element. See the specific element
     * type for fields that can be updated. */
    updateData(elementInitData) {
        //no action;
    }
}


HeadingElement.DEFAULT_HEADING_LEVEL = 2;

HeadingElement.TYPE_NAME = "heading";




