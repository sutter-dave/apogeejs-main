
/** This class manages links for the web page.*/
apogeeapp.app.LinkEntry = function(libraryUI,linkData,linkType) {
    this.id = apogeeapp.app.LibraryUI._createId();
    this.libraryUI = libraryUI;
    
    this.linkType = linkType;
    this.url = linkData.url;
    
    var nickname = linkData.nickname;
    if((!nickname)||(nickname.length === 0)) nickname = this.createLinkNameFromUrl(this.url);
    this.nickname = nickname;
    
    
    this.treeEntry = this.createTreeEntry();
}

apogeeapp.app.LinkEntry.LINK_TYPE_JS = "js link";
apogeeapp.app.LinkEntry.LINK_TYPE_CSS = "css link";

apogeeapp.app.LinkEntry.JS_ELEMENT_TYPE = "script";
apogeeapp.app.LinkEntry.CSS_ELEMENT_TYPE = "link";

apogeeapp.app.LinkEntry.JS_ICON_RES_PATH = "/genericIcon.png";
apogeeapp.app.LinkEntry.CSS_ICON_RES_PATH = "/genericIcon.png";

apogeeapp.app.LinkEntry.JS_LINK_LIST_INFO = {
    "typeName": apogeeapp.app.LinkEntry.LINK_TYPE_JS,
    "addEntry": (libraryUI) => {
        var addEntry = apogeeapp.app.updatelink.getAddLinkCallback(libraryUI,apogeeapp.app.LinkEntry.LINK_TYPE_JS);
        addEntry();
    },
    "createEntryFunction": (libraryUI, linkData) => new apogeeapp.app.LinkEntry(libraryUI,linkData,apogeeapp.app.LinkEntry.LINK_TYPE_JS),
    "listName": "JS Links",
    "addEntryText":"Add JS Link",
    "listIconPath":"/genericIcon.png"
}

apogeeapp.app.LinkEntry.CSS_LINK_LIST_INFO = {
    "typeName": apogeeapp.app.LinkEntry.LINK_TYPE_CSS,
    "addEntry": (libraryUI) => {
        var addEntry = apogeeapp.app.updatelink.getAddLinkCallback(libraryUI,apogeeapp.app.LinkEntry.LINK_TYPE_CSS);
        addEntry();
    },
    "createEntryFunction": (libraryUI, linkData) => new apogeeapp.app.LinkEntry(libraryUI,linkData,apogeeapp.app.LinkEntry.LINK_TYPE_CSS),
    "listName": "CSS Links",
    "addEntryText":"Add CSS Link",
    "listIconPath":"/genericIcon.png"
}

//---------------------------
// library entry interface
//---------------------------

apogeeapp.app.LinkEntry.prototype.getId = function() {
    return this.id;
}

apogeeapp.app.LinkEntry.prototype.getEntryType = function() {
    return this.linkType;
}

/** This method loads the link onto the page. It returns a promise that
 * resolves when the link is loaded. */
apogeeapp.app.LinkEntry.prototype.getTreeEntry = function() {
    return this.treeEntry;
}

apogeeapp.app.LinkEntry.prototype.getUrl = function() {
    return this.url;
}

apogeeapp.app.LinkEntry.prototype.getNickname = function() {
    return this.nickname;
}


/** This method loads the link onto the page. It returns a promise that
 * resolves when the link is loaded. */
apogeeapp.app.LinkEntry.prototype.loadEntry = function() {
    
    var promiseFunction = (resolve,reject) => {
        //make sure this link does not already exist
//OOPS - THIS NEEDS TO BE FIXED! CHECK THIS DIFFERENTLY
        var element = document.getElementById(this.url);
        if(element) {
            var errorMsg = "The link already exists: " + this.url;
            this.setBannerState(apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR,errorMsg);
            reject(errorMsg);
this.libraryUI.entryStatusChange(this);
            return;
        }
        else {
            var linkProps;
            var elementType;
            
            //create link properties
            if(this.linkType == apogeeapp.app.LinkEntry.LINK_TYPE_JS) {
                linkProps = this.getJsLinkProps();
                elementType = apogeeapp.app.LinkEntry.JS_ELEMENT_TYPE;
            }
            else if(this.linkType == apogeeapp.app.LinkEntry.LINK_TYPE_CSS) {
                linkProps = this.getCssLinkProps();
                elementType = apogeeapp.app.LinkEntry.CSS_ELEMENT_TYPE;
            }
            else {
                var errorMsg = "Unknown link type " + this.linkType;
                this.setBannerState(apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR,errorMsg);
                reject(errorMsg);
this.libraryUI.entryStatusChange(this);
                return;
            }
            
            //add event handlers
            linkProps.onload = () => {
                this.setBannerState(apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE);
                resolve(this.url);
this.libraryUI.entryStatusChange(this);
            }
            linkProps.onerror = (msg) => {
                var errorMsg = "Error loading link " + this.url + ": " + msg;
                this.setBannerState(apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR,errorMsg);
                reject(errorMsg);
this.libraryUI.entryStatusChange(this);
            }
            
            //insert the link entry
            element = apogeeapp.ui.createElement(elementType,linkProps);
            document.head.appendChild(element);
        }
    }
    
    //call link added to library
    this.libraryUI.entryInserted(this);
    
    //return promise to track loading finish
    return new Promise(promiseFunction);
}

/** This method loads the link onto the page. It returns a promise that
 * resolves when the link is loaded. */
apogeeapp.app.LinkEntry.prototype.saveEntry = function() {
    var entryJson = {};
    entryJson.url = this.url;
    if(this.nickname != this.url) entryJson.nickname = this.nickname;
    entryJson.entryType = this.linkType;
    return entryJson;
}

/** This method removes the link. */
apogeeapp.app.LinkEntry.prototype.remove = function() {
    var element = document.getElementById(this.getElementId());
    if(element) {
        document.head.removeChild(element);
    }
    
    this.libraryUI.entryRemoved(this);
}

//-------------------------
// Entry specific management methods
//-------------------------

/** This method removes and reloads the link, returning a promise. */
apogeeapp.app.LinkEntry.prototype.updateData = function(url,nickname) {
    
    //update nickname
    if((!nickname)||(nickname.length === 0)) nickname = this.createLinkNameFromUrl(url);
    if(this.nickname != nickname) {
        this.nickname = nickname;
        this.treeEntry.setLabel(this.nickname);
    }
    
    //update url
    if(this.url != url) {
        this.url = url;
        this.remove();
        var promise = this.loadEntry();
    }
    
    //if we didn't update, create a dummy promise
    if(!promise) promise = Promise.resolve("No url update");
    
    return promise;
}



//===================================
// private methods
//===================================

apogeeapp.app.LinkEntry.prototype.createLinkNameFromUrl = function(url) {
    return url;
}

apogeeapp.app.LinkEntry.prototype.getJsLinkProps = function() {
    var linkProps = {};
    linkProps.id = this.getElementId();
    linkProps.src = this.url;
    return linkProps;
}

apogeeapp.app.LinkEntry.prototype.getCssLinkProps = function() {
    var linkProps = {};
    linkProps.id = this.getElementId();
    linkProps.rel = "stylesheet";
    linkProps.type = "text/css";
    linkProps.href = this.url;
    return linkProps;
}

apogeeapp.app.LinkEntry.ELEMENT_ID_BASE = "__apogee_link_element_";

apogeeapp.app.LinkEntry.prototype.getElementId = function() {
    return apogeeapp.app.LinkEntry.ELEMENT_ID_BASE + this.id;
}

apogeeapp.app.LinkEntry.prototype.setBannerState = function(bannerState,bannerMessage) {
    var iconOverlay = apogeeapp.app.WindowHeaderManager.getIconOverlay(bannerState);
    if(iconOverlay) {
        this.treeEntry.setIconOverlay(iconOverlay);
    }
    else {
        this.treeEntry.clearIconOverlay();
    }
}

apogeeapp.app.LinkEntry.prototype.createTreeEntry = function() {
    var iconUrl = this.getIconUrl();
    var menuItemsCallback = () => this.getMenuItems();
    return new apogeeapp.ui.treecontrol.TreeEntry(this.nickname, iconUrl, null, menuItemsCallback, false);
}

/** This method returns the icon url for the component. */
apogeeapp.app.LinkEntry.prototype.getIconUrl = function() {
    var resPath;
    
    if(this.linkType == apogeeapp.app.LinkEntry.LINK_TYPE_JS) {
        resPath = apogeeapp.app.LinkEntry.JS_ICON_RES_PATH;
    }
    else if(this.linkType == apogeeapp.app.LinkEntry.LINK_TYPE_CSS) {
        resPath = apogeeapp.app.LinkEntry.CSS_ICON_RES_PATH;
    }
    else {
        resPath = apogeeapp.app.Component.DEFAULT_ICON_RES_PATH;
    }
  
    return apogeeapp.ui.getResourcePath(resPath);
}

apogeeapp.app.LinkEntry.prototype.getMenuItems = function() {
    //menu items
    var menuItemList = [];

    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Update Link";
    itemInfo.callback = apogeeapp.app.updatelink.getUpdateLinkCallback(this);
    menuItemList.push(itemInfo);
    
    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Remove Link";
    itemInfo.callback = apogeeapp.app.updatelink.getRemoveLinkCallback(this);
    menuItemList.push(itemInfo);
    
    return menuItemList;
}
