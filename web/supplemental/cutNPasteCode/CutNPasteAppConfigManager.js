/** 
 * This is the format of the AppConfigManager. This class does not need
 * to be extended. It has not internal functionality.
 */
apogeeapp.app.CutNPasteAppConfigManager = class {
    
    constructor() {
    }
    
    /** This method should return a Promise object the loades the
     * app configuration.
     */
    getConfigPromise(app) {
        var configUrl = apogee.util.readQueryField("config",document.URL);
        var configFilePromise;
        if(configUrl) {
            configFilePromise = apogee.net.jsonRequest(configUrl);
            //chain the file download promise to the init settings promise
            return configFilePromise.then(appSettings => app.getConfigurationPromise(appSettings));
        }
        else {
            //is there is no config file return an "empty" promise
            return Promise.resolve();
        }   
    };
    
    /** This method should return a default FileAccessObject. It will be loaded
     * if an alternate is not loaded in configuration.
     */
    getDefaultFileAccessObject(app) {
        return new apogeeapp.app.CutNPasteFileAccess();
    }
    
    /** This method should return a promise for the initial workspace
     * that should be loaded
     */
    getInitialWorkspaceFilePromise(app) {
        var workspaceUrl = apogee.util.readQueryField("url",document.URL);
        if(workspaceUrl) {
            return apogee.net.textRequest(workspaceUrl);
        } else {
            return null;
        }
    }
    
    /** This method should return the file metadata for the intial workspace.
     * This will be used in saving the initail workspace. (For example, if the
     * initial workspace is a locally loaded file in the electron version, this
     * file metadata will allow the user to select "save" to update the file 
     * without having to select a file to save to.
     */
    getInitialWorkspaceFileMetadata(app) {
        return null;
    }
}


