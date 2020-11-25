import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {uiutil}  from "/apogeeui/apogeeUiLib.js";
import OneDriveFileAccess from "./OneDriveFileAccess.js";

export class OneDriveFileSource {
    /** constructor */
    constructor(metadata,data,action,onActionComplete) {
        this.data = data;
        this.action = action;
        this.metadata = metadata;
        //this is a callback to signify the save/open is successful/failed/canceled
        this.onActionComplete = onActionComplete;

        //this object is the interface to OneDrive
        this.fileAccess = new OneDriveFileAccess();

        //this is a callback to notify the dialog the action is complete
        this.onDialogComplete = null;

        // this.drivesInfo
        // this.selectedDriveId
        this.driveSelectionElementMap = {}

        // this.filesInfo
        // this.selectedFileId
        this.fileElementMap = {};


        // this.actionElement
        // this.configElement

        // this.fileNameTextField
        // this.pathCell
        // this.fileListElement
        // this.drivesListElement
        // this.allRadio
        // this.jsonRadio

        // this.loginElement
        // this.userElement
        // this.logoutElement
    }

    //============================
    // Public Methods
    //============================

    getName() {
        return OneDriveFileSource.NAME;
    }

    getDisplayName() {
        return OneDriveFileSource.DISPLAY_NAME;
    }

    //-----------------------------
    // File Actions
    //-----------------------------

    updateFile(fileMetadata,data) {
        let saveFilePromise = this.fileAccess.updateFile(fileMetadata.driveId,fileMetadata.fileId,data);

        saveFilePromise.then( result => {
            //success
            if(this.onActionComplete) this.onActionComplete(null,true,result.fileMetadata); 
            if(this.onDialogComplete) this.onDialogComplete(true);
        }).catch(errorMsg => {
            //error
            if(this.onActionComplete) this.onActionComplete(errorMsg,false,null);
            //decide is we want to keep the dialog opened or closed...
            if(this.onDialogComplete) this.onDialogComplete(true);
        }) ;
    }

    createFile(driveId,folderId,fileName,data) {
        let saveFilePromise = this.fileAccess.createFile(driveId,folderId,fileName,data);

        saveFilePromise.then( result => {
            //success
            if(this.onActionComplete) this.onActionComplete(null,true,result.fileMetadata); 
            if(this.onDialogComplete) this.onDialogComplete(true);
        }).catch(errorMsg => {
            //error
            if(this.onActionComplete) this.onActionComplete(errorMsg,false,null);
            //decide is we want to keep the dialog opened or closed...
            if(this.onDialogComplete) this.onDialogComplete(true);
        }) ;
    }

    openFile(fileId) {
        let openFilePromise = this.fileAccess.openFile(fileId);

        openFilePromise.then( result => {
            //success
            if(this.onActionComplete) this.onActionComplete(null,result.data,result.fileMetadata); 
            if(this.onDialogComplete) this.onDialogComplete(true);
        }).catch(errorMsg => {
            //error
            if(this.onActionComplete) this.onActionComplete(errorMsg,false,null);
            //decide is we want to keep the dialog opened or closed...
            if(this.onDialogComplete) this.onDialogComplete(true);
        }) ;
    }

    cancelAction() {
        if(this.onActionComplete) this.onActionComplete(null,false,null);
        //close dialog
        if(this.onDialogComplete) this.onDialogComplete(true);
    }

    /** This method is called externally after the dialog box using the soruce closes. */
    close() {
        //FILL THIS IN!!!
        if(this.configElement) {
            this.configElement = null;
        }
        if(this.actionElement) {
            this.actionElement = null;
        }
    }

    //-----------------------------
    // UI Interface
    //-----------------------------

    makeActive() {

    }

    getIconUrl() {
        return null;
    }

    getConfigDomElement() {
        if(!this.configElement) {
            this.configElement = this._createConfigElement();
        }
        return this.configElement;
    }

    setOnDialogComplete(onDialogComplete) {
        this.onDialogComplete = onDialogComplete
    }

    getActionElement() {
        if(!this.actionElement) {
            this._createActionElement();
            //populate initial data
            this._populateActionForm();
        }
        return this.actionElement;
    }

    getConfigElement() {
        if(!this.configElement) {
            this._createConfigElement();
            //set initial login state
            let loginState = this.fileAccess.getLoginState();
            this._setLoginState(loginState);
        }
        return this.configElement;
    }


    //===================================
    // Private Methods
    //===================================

    //--------------------
    // command handlers
    //--------------------

    _onLoginCommand() {
        let loginPromise = this.fileAccess.login();
        loginPromise.then(loginState => {
            this._setLoginState(loginState);
        }).catch(errorMsg => {
            alert("Error logging in: " + errorMsg);
        });
    }

    _onLogoutCommand() {
        let logoutPromise = this.fileAccess.logout();
        logoutPromise.then(loginState => {
            this._setLoginState(loginState);
        }).catch(errorMsg => {
            alert("Error logging out: " + errorMsg);
        });
    }

    _onParentFolderSelect(parentFileId) {
        this._loadFolder(this.selectedDriveId, parentFileId);
    }

    _onFilterChange() {

    }

    _onCreateFolder(something) {

    }

    _onFileClick(fileInfo) {
        //select element
        let oldSelectedFileId = this.selectedFileId;
        if(oldSelectedFileId) {
            let oldSelectedFileElement = this.fileElementMap[oldSelectedFileId];
            if(oldSelectedFileElement) {
                oldSelectedFileElement.classList.remove("oneDriveFileAccess_fileListEntryElementActive");
            }
        }
        this.selectedFileId = fileInfo.id;
        if(this.selectedFileId) {
            let newSelectedFileElement = this.fileElementMap[this.selectedFileId];
            if(newSelectedFileElement) {
                newSelectedFileElement.classList.add("oneDriveFileAccess_fileListEntryElementActive");
            }
        }

        //take any needed action
        if(fileInfo.type == "__folder__") {
            //open the folder
            this._loadFolder(this.selectedDriveId, fileInfo.id);
        }
        else {
            //put the name in the file name field
            this.fileNameTextField.value = fileInfo.name;
        }

    }

    _onFileDelete(something) {

    }

    _onFileRename(something) {

    }

    _onOpenPress() {
        if(!this.selectedDriveId) {
            alert("There is no selected drive!");
            return;
        }
        if((!this.filesInfo)||(!this.fileInfo.folder)) {
            alert("There is no selected folder!");
            return;
        }
        if(!this.selectedFileId) {
            alert("There is no file selected");
            return
        }
        this.createFile(this.selectedDriveId,this.fileInfo.folder.fileId,this.selectedFileId);
    }

    _onSavePress() {
        if(!this.selectedDriveId) {
            alert("There is no selected drive!");
            return;
        }
        if((!this.filesInfo)||(!this.fileInfo.folder)) {
            alert("There is no selected folder!");
            return;
        }
        let folderId = this.fileInfo.folder.fileId;
        let fileName = this.fileNameTextField.value.trim();
        if(fileName.length === 0) {
            alert("No file name is entered");
        }

        this.createFile(this.selectedDriveId,folderId,fileName,this.data);
    }

    _onCancelPress() {

    }

    /** This function changes the active source */
    _onSelectDrive(driveId) {

        let oldSelectedDriveId = this.selectedDriveId;
        this.selectedDriveId = driveId;

        if(oldSelectedDriveId !== undefined) {
            let oldElement = this.driveSelectionElementMap[oldSelectedDriveId];
            oldElement.classList.remove("oneDriveFileAccess_driveElementActive");
        }
        if(this.selectedDriveId !== undefined) {
            let newElement = this.driveSelectionElementMap[this.selectedDriveId];
            newElement.classList.add("oneDriveFileAccess_driveElementActive");

            //load the default folder
            this._loadFolder(this.selectedDriveId,null);
        }
  
    }

    //---------------------
    //internal methods
    //----------------------

    _setLoginState(loginState) {
        this.loginState = loginState;
        if(this.configElement) {
            if(loginState.state == "logged in") {
                this.loginElement.style.display = "none";
                if(loginState.accountName) {
                    this.userElement.innerHTML = loginState.accountName;
                    this.userElement.style.display = "";
                }
                else {
                    this.userElement.style.display = "none";
                }
                this.logoutElement.style.display = "";
                this.accountMsgElement.style.display = "none";
            }
            else if(loginState.state == "logged out") {
                this.loginElement.style.display = "";
                this.userElement.style.display = "none";
                this.userElement.innerHTML = "";
                this.logoutElement.style.display = "none";
                this.accountMsgElement.style.display = "none";
            }
            else {
                //for now we will leave it to this...
                this.accountMsgElement.display = "";
                this.accountMsgEement.innerHTML = "OTHER STATE!!!"

                this.loginElement.style.display = "none";
                this.userElement.style.display = "none";
                this.userElement.innerHTML = "";
                this.logoutElement.style.display = "none";
            }
        }
    }

    _setDrivesInfo(drivesInfo) {
        this.drivesInfo = drivesInfo;

        this.selectedDriveId = undefined;
        this.driveSelectionElementMap = {};
        uiutil.removeAllChildren(this.drivesListElement);

        if(this.drivesInfo) {
            let selectedDriveId; 
            if(drivesInfo.defaultDriveId) selectedDriveId = drivesInfo.defaultDriveId;

            if((this.drivesInfo.drives)&&(this.drivesInfo.drives.length > 0)) {
                this.drivesInfo.drives.forEach( driveInfo => this._addDriveElement(driveInfo))

                if(selectedDriveId === undefined) {
                    selectedDriveId = this.drivesInfo.drives[0].id;
                }
            }

            //set initial drive state
            if(selectedDriveId !== undefined) {
                this._onSelectDrive(selectedDriveId);
            }
        }
        
    }

    _loadFolder(driveId, folderId) {
        let filesInfoPromise = this.fileAccess.loadFolder(driveId,folderId);
        filesInfoPromise.then(filesInfo => {
            this._setFilesInfo(filesInfo);
        }).catch(errorMsg => {
            this._setFilesInfo(null);
            alert("Error opening folder");
        })
    }


    _setFilesInfo(filesInfo) {
        this.filesInfo = filesInfo;
        this.fileElementMap = {};
        this.selectedFileId = undefined;

        this._populatePathCell();
        this._populateFileList();

    }

    _populatePathCell() {
        uiutil.removeAllChildren(this.pathCell);
        uiutil.removeAllChildren(this.fileListElement);

        let selectedDriveInfo = this._getSelectedDriveInfo();
        if(selectedDriveInfo) {
            this.pathCell.appendChild(this._getPathDriveElement(selectedDriveInfo));
        }
        if(this.filesInfo) {
            if(this.filesInfo.path) {
                this.filesInfo.path.forEach( (pathEntry,index) => {
                    if(index >= 1) {
                        this.pathCell.appendChild(this._getPathDelimiterElement());
                    }
                    this.pathCell.appendChild(this._getPathElement(pathEntry));
                })
            }
        }
        
    }

    _getSelectedDriveInfo() {
        if((this.drivesInfo)&&(this.drivesInfo.drives)&&(this.selectedDriveId)) {
            return this.drivesInfo.drives.find( driveEntry => driveEntry.id == this.selectedDriveId);
        }
        else return undefined;
    }

    _populateFileList() {
        uiutil.removeAllChildren(this.fileListElement);
        if((this.filesInfo)&&(this.filesInfo.files)) {
            this.filesInfo.files.forEach(filesInfo => this._addFileListEntry(filesInfo));
        }
    }

    _populateActionForm() {
        let drivesInfoPromise = this.fileAccess.getDrivesInfo();
        drivesInfoPromise.then(drivesInfo => {
            this._setDrivesInfo(drivesInfo);
        }).catch(errorMsg => {
            //figure out what to do here
            alert("Get better drive info error handling!")
        })
    }

    //--------------------
    // create elements
    //--------------------

    _createConfigElement() {
        let container = document.createElement("div");
        container.className = "oneDriveFileAccess_configContainer";

        this.loginElement = document.createElement("div");
        this.loginElement.className = "oneDriveFileAccess_loginElement";
        this.loginElement.innerHTML = "Login"
        this.loginElement.onclick = () => this._onLoginCommand();
        container.appendChild(this.loginElement);

        this.userElement = document.createElement("div");
        this.userElement.className = "oneDriveFileAccess_userElement";
        container.appendChild(this.userElement);

        this.logoutElement = document.createElement("div");
        this.logoutElement.className = "oneDriveFileAccess_logoutElement";
        this.logoutElement.innerHTML = "Logout"
        this.logoutElement.onclick = () => this._onLogoutCommand();
        container.appendChild(this.logoutElement);

        this.accountMsgElement = document.createElement("div");
        this.accountMsgElement.className = "oneDriveFileAccess_accountMsgElement";
        container.appendChild(this.accountMsgElement);


        this.configElement = container;
    }


    _createActionElement() {
        //action element
        let mainContainer = document.createElement("table");
        mainContainer.className = "oneDriveFileAccess_mainContainer";

        let pathRow = document.createElement("tr");
        mainContainer.appendChild(pathRow);
        let commandRow = document.createElement("tr");
        mainContainer.appendChild(commandRow);
        let fileDisplayRow = document.createElement("tr");
        mainContainer.appendChild(fileDisplayRow);
        let fileNameRow = document.createElement("tr");
        mainContainer.appendChild(fileNameRow);
        let buttonsRow = document.createElement("tr");
        mainContainer.appendChild(buttonsRow);

        //drive selection
        let drivesTitleCell = document.createElement("td");
        drivesTitleCell.className = "oneDriveFileAccess_driveTitle";
        drivesTitleCell.innerHTML = "Drives:"
        pathRow.appendChild(drivesTitleCell);

        let drivesCell = document.createElement("td");
        drivesCell.className = "oneDriveFileAccess_drivesCell";
        drivesCell.rowSpan = 4;
        commandRow.appendChild(drivesCell);

        this.drivesListElement = document.createElement("div");
        this.drivesListElement.className = "oneDriveFileAccess_driveList";
        drivesCell.appendChild(this.drivesListElement);

        //path display
        this.pathCell = document.createElement("td");
        this.pathCell.className = "oneDriveFileAccess_pathCell";
        pathRow.appendChild(this.pathCell);

        //commands - parent folder, file type filter, add folder (for save only)
        let commandCell = document.createElement("td");
        commandCell.className = "oneDriveFileAccess_commandCell";
        commandRow.appendChild(commandCell);

        let parentFolderButton = document.createElement("button");
        parentFolderButton.innerHTML = "^";
        parentFolderButton.onclick = () => this._onParentFolderButton();
        commandCell.appendChild(parentFolderButton);
        if(this.action == "save") {
            let addFolderButton = document.createElement("button");
            addFolderButton.innerHTML = "+"
            addFolderButton.onclick = () => this._onCreateFolder();
            commandCell.appendChild(addFolderButton);
        }

        let filterWrapper = document.createElement("div");
        filterWrapper.className = "oneDriveFileAccess_filterWrapper";
        commandCell.appendChild(filterWrapper);
        
        let fileFilterLabel = document.createElement("span");
        fileFilterLabel.innerHTML = "Show Files: "
        filterWrapper.appendChild(fileFilterLabel);
        let radioGroupName = apogeeutil.getUniqueString();
        let allId = apogeeutil.getUniqueString();
        let jsonId = apogeeutil.getUniqueString();

        this.allRadio = document.createElement("input");
        this.allRadio.type = "radio";
        this.allRadio.name = radioGroupName;
        this.allRadio.value = "all";
        this.allRadio.onclick = () => this._onFilterChange();
        filterWrapper.appendChild(this.allRadio);
        let allRadioLabel = document.createElement("label");
        allRadioLabel.for = allId;
        allRadioLabel.innerHTML = "All";
        filterWrapper.appendChild(allRadioLabel);

        this.jsonRadio = document.createElement("input");
        this.jsonRadio.type = "radio";
        this.jsonRadio.name = radioGroupName;
        this.jsonRadio.value = "json";
        this.jsonRadio.onChange = () => this._onFilterChange();
        filterWrapper.appendChild(this.jsonRadio);
        let jsonRadioLabel = document.createElement("label");
        jsonRadioLabel.for = jsonId;
        jsonRadioLabel.innerHTML = "JSON";
        filterWrapper.appendChild(jsonRadioLabel);
        
        //file display list
        let fileListCell = document.createElement("td");
        fileListCell.className = "oneDriveFileAccess_fileListCell";
        fileDisplayRow.appendChild(fileListCell);

        this.fileListElement = document.createElement("div");
        this.fileListElement.className = "oneDriveFileAccess_fileListElement";
        fileListCell.appendChild(this.fileListElement);

        //file name entry
        let fileNameCell = document.createElement("td");
        fileNameCell.className = "oneDriveFileAccess_fileNameCell";
        fileNameRow.appendChild(fileNameCell);

        let fileNameLabel = document.createElement("span");
        fileNameLabel.className = "oneDriveFileAccess_fileNameLabel";
        fileNameLabel.innerHTML = "File Name:";
        fileNameCell.appendChild(fileNameLabel);
        this.fileNameTextField = document.createElement("input");
        this.fileNameTextField.type = "text";
        this.fileNameTextField.className = "oneDriveFileAccess_fileNameTextField";
        fileNameCell.appendChild(this.fileNameTextField);

        //save/open, cancel buttons
        let buttonsCell = document.createElement("td");
        buttonsCell.className = "oneDriveFileAccess_buttonsCell";
        buttonsRow.appendChild(buttonsCell);

        let submitButton = document.createElement("button");
        submitButton.innerHTML = (this.action == "save") ? "Save": "Open";
        submitButton.className = "oneDriveFileAccess_submitButton";
        buttonsCell.appendChild(submitButton);
        let cancelButton = document.createElement("button");
        cancelButton.innerHTML = "Cancel";
        cancelButton.className = "oneDriveFileAccess_cancelButton";
        buttonsCell.appendChild(cancelButton);

        this.actionElement = mainContainer;
    }

    /** This function sets of the source selection items */
    _addDriveElement(driveInfo) {
        let driveElement = document.createElement("div");
        driveElement.className = "oneDriveFileAccess_driveElement";
        driveElement.innerHTML = driveInfo.name;
        driveElement.onclick = () => this._onSelectDrive(driveInfo.id);

        this.driveSelectionElementMap[driveInfo.id] = driveElement;
        this.drivesListElement.appendChild(driveElement);
    }


    _getPathDriveElement(driveEntry) {
        let driveElement = document.createElement("span");
        driveElement.className = "oneDriveFileAccess_pathDriveElement";
        driveElement.innerHTML = driveEntry.name + ":";
        return driveElement;
    }

    _getPathDelimiterElement() {
        let delimiterElement = document.createElement("span");
        delimiterElement.className = "oneDriveFileAccess_pathDelimiterElement";
        delimiterElement.innerHTML = ">";
        return delimiterElement;
    }

    _getPathElement(pathEntry) {
        let folderElement = document.createElement("span");
        folderElement.className = "oneDriveFileAccess_pathFileElement";
        folderElement.innerHTML = pathEntry.name;
        return folderElement;
    }

    _addFileListEntry(fileInfo) {
        let fileElement = document.createElement("div");
        fileElement.className = "oneDriveFileAccess_fileListEntryElement";
        fileElement.innerHTML = fileInfo.name;
        this.fileListElement.appendChild(fileElement);

        fileElement.onclick = () => this._onFileClick(fileInfo);
        this.fileElementMap[fileInfo.id] = fileElement;
    }

}

//this is the identifier name for the source
OneDriveFileSource.NAME = OneDriveFileAccess.NAME

//this is the identifier name for the source
OneDriveFileSource.DISPLAY_NAME = OneDriveFileAccess.DISPLAY_NAME

//this is metadata for a new file. Name is blank and there is not additional data besides source name.
OneDriveFileSource.NEW_FILE_METADATA = OneDriveFileAccess.NEW_FILE_METADATA

OneDriveFileSource.directSaveOk = OneDriveFileAccess.directSaveOk