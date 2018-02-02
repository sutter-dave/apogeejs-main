/** This is a grid editor using hands on table*/
apogeeapp.app.HandsonGridEditor = class extends apogeeapp.app.EditorDataDisplay {
    
    constructor(viewMode,callbacks) {
        super(viewMode,callbacks,apogeeapp.app.EditorDataDisplay.NON_SCROLLING);
        
        var containerDiv = this.getElement();

        //TBR initial sizing. now I just set it to a dummy number	
        this.gridDiv = apogeeapp.ui.createElement("div",null,{
            "position":"absolute",
            "top":"0px",
            "left":"0px",
            "width":"50px",
            "height":"50px",
            "overflow":"hidden",
            "zIndex":0
        });
        containerDiv.appendChild(this.gridDiv);

        this.inputData = null;
        this.activeEditOk = undefined;
        this.dataCached = false;

       //we have to make sure the element is loaded before initailizing for handsontable to work properly
       this.loaded = false;

        //grid edited function
        this.gridEdited = (args) => {
            //I am doing this because it tries to save on the initial creation
            //I am sure there is some other way to prevent this.
            if(!this.gridControl) return;
            
            this.save(arguments);
        }

        //on a paste, the event is fired for each row created. We delay it here to haev fewer updates of the rest of the sheet
        this.timerInProcess = false;
        var REFRESH_DELAY = 50;

        this.delayGridEdited = (args) => {

            //if there is no timer waiting, start a timer
            if(!this.timerInProcess) {
                this.timerInProcess = true;
                var callEditEvent = (args) => {
                    this.timerInProcess = false;
                    this.gridEdited(arguments);
                }
                setTimeout(callEditEvent,REFRESH_DELAY);
            }
        }

    }

//=============================
// "Package" Methods
//=============================
    getEditorData() {
        //update "input" data before calling update
        if(this.gridControl) this.inputData = apogee.util.jsonCopy(this.gridControl.getData());
        return this.inputData;
    }
    
    setEditorData(json) {
        if((this.inputData === json)&&(this.editOk)) return;
	
        this.inputData = json;
        this.dataCached = true;

        if(this.loaded) {
            this.displayData();
        }
    }

    onLoad() {
        this.loaded = true;
        if(this.dataCached) {
            this.displayData();
        }
    }

    onUnload() {
        this.loaded = false;
    }

    onResize() {
        this.setSize();
    }

    setSize() {  
        if(this.gridDiv) {
            this.gridDiv.style.width = this.outsideDiv.clientWidth + "px";
            this.gridDiv.style.height = this.outsideDiv.clientHeight + "px";
            if(this.gridControl) {
                this.gridControl.render();
            }
        }
    }

    destroy() {
        if(this.gridControl) {
            this.gridControl.destroy();
            this.gridControl = null;
        }
    }

//==============================
// Private Methods
//==============================

    /** This method creates a new grid. 
     * @private */
    createNewGrid(initialData) {
        if(this.gridControl) {
            this.gridControl.destroy();
            this.gridControl = null;
        }

        var gridOptions; 
        if(this.editOk) {
            gridOptions = {
                data: initialData,
                rowHeaders: true,
                colHeaders: true,
                contextMenu: true,
                //edit callbacks
                afterChange:this.gridEdited,
                afterCreateCol:this.delayGridEdited,
                afterCreateRow:this.delayGridEdited,
                afterRemoveCol:this.gridEdited,
                afterRemoveRow:this.gridEdited
            }
            this.gridEditable = true;
        }
        else {
            gridOptions = {
                data: initialData,
                readOnly: true,
                rowHeaders: true,
                colHeaders: true,
            }
            this.gridEditable = false;
        }

        this.gridControl = new Handsontable(this.gridDiv,gridOptions); 

        this.setSize();
    }
    
    
    //we must be loaded before creating objects
    displayData() {

        //clear the cached data flag, if it is present
        this.dataCached = false;

        var editData = apogee.util.jsonCopy(this.inputData);
        if(!editData) {
            editData = [[]];
        }

        if((!this.gridControl)||(this.activeEditOk !== this.editOk)) {
            this.createNewGrid(editData);
            this.activeEditOk = this.editOk;
        }
        else {
            this.gridControl.loadData(editData);
        }

        //set the background color
        if(this.editOk) {
            this.gridDiv.style.backgroundColor = "";
        }
        else {
            this.gridDiv.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
        }
    }

}
