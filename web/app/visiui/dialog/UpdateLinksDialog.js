/** This method shows an update control dialog. The argument onSaveData si the same
 * arguments as the updateControl event handler html. */
visicomp.app.visiui.dialog.showUpdateLinksDialog = function(app) {
    
    var dialog = new visicomp.visiui.Dialog("Dialog",
            {"minimizable":true,"maximizable":true,"movable":true,"resizable":true});
            
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
    
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Update Links"}));
    content.appendChild(line);
        
    //editor selector
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"}); 
    var jsLinksRadio = visicomp.visiui.createElement("input",{"type":"radio","name":"controlContent","value":"jsLinks"});
    line.appendChild(jsLinksRadio);
    line.appendChild(document.createTextNode("JS Links"));
    content.appendChild(line);
    var cssLinksRadio = visicomp.visiui.createElement("input",{"type":"radio","name":"controlContent","value":"cssLinks"});
    line.appendChild(cssLinksRadio);
    line.appendChild(document.createTextNode("CSS Links"));
    
    //editors
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var editorDiv = visicomp.visiui.createElement("div",null,
        {
            "position":"relative",
            "width":"500px",
            "height":"300px",
            "border":"1px solid darkgray"
        });
    line.appendChild(editorDiv);
    content.appendChild(line);
        
    //create editor containers - will be hiddedn and shown
    var jsLinksEditorDiv = visicomp.visiui.createElement("div",null,{
        "position":"absolute",
        "top":"0px",
        "bottom":"0px",
        "right":"0px",
        "left":"0px"
    });
    var jsLinksEditor = null;
    editorDiv.appendChild(jsLinksEditorDiv);
    
    var cssLinksEditorDiv = visicomp.visiui.createElement("div",null,{
        "position":"absolute",
        "top":"0px",
        "bottom":"0px",
        "right":"0px",
        "left":"0px"
    });
    var cssLinksEditor = null;
    editorDiv.appendChild(cssLinksEditorDiv);
    
    //save and cancel buttons
    //buttons and handler
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        dialog.hide();
    }
    
    var onSave = function() {
        var jsResult;
        var cssResult;

        if(jsLinksEditor) {
            var jsLinks = jsLinksEditor.getSession().getValue().trim();
            app.setJsLinks(jsLinks);
		}
        
        if(cssLinksEditor) {
            var cssLinks = cssLinksEditor.getSession().getValue().trim();
            app.setCssLinks(cssLinks);
		}
        
//figrue out error handling here
		dialog.hide();
    }
    
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Save","onclick":onSave}));
    content.appendChild(line);
    
    //show the dialog
    dialog.setContent(content);
    dialog.setZIndex(100);
    dialog.show();
    dialog.centerOnPage(); 
    
    var showJsLinksFunction = function() {
        //hide the onLoad div and show the html dive
        cssLinksEditorDiv.style.display = "none";
        jsLinksEditorDiv.style.display = "";
        
        //create html editor if needed
        if(!jsLinksEditor) {
            jsLinksEditor = ace.edit(jsLinksEditorDiv);
            jsLinksEditor.setTheme("ace/theme/eclipse");
            jsLinksEditor.getSession().setMode("ace/mode/text");
            //set the value
            var jsLinks = app.getJsLinks();
            if(jsLinks) {
                jsLinksEditor.getSession().setValue(jsLinks);
            }
        }
    }
    
    var showCssLinksFunction = function() {
        //hide the onLoad div and show the html dive
        cssLinksEditorDiv.style.display = "";
        jsLinksEditorDiv.style.display = "none";
        
        //create html editor if needed
        if(!cssLinksEditor) {
            cssLinksEditor = ace.edit(cssLinksEditorDiv);
            cssLinksEditor.setTheme("ace/theme/eclipse");
            cssLinksEditor.getSession().setMode("ace/mode/text");
            //set the value
            var cssLinks = app.getCssLinks();
            if(cssLinks) {
                cssLinksEditor.getSession().setValue(cssLinks);
            }
        }
    }
    
    //show html first
    jsLinksRadio.checked = true;
    showJsLinksFunction();
    
    //radio change handler
    var onRadioChange = function() {
        if(cssLinksRadio.checked) {
            showCssLinksFunction();
        }
        else if(jsLinksRadio.checked) {
            showJsLinksFunction();
        }
    }
    
    cssLinksRadio.onchange = onRadioChange;
    jsLinksRadio.onchange = onRadioChange;
    
    //set the resize handler
    //resize the editor on window size change
    var resizeCallback = function() {
        //this needs to be fixed
        var container = content.parentElement;
        //this is kind of cludgy, I am using this as the last line and assuming it has even margins
        var margin = line.offsetLeft;
        var endPosition = line.offsetTop + line.offsetHeight + margin;
        var totalWidth = container.clientWidth - 2 * margin;
        var extraHeight = container.clientHeight - endPosition;
        //size the editor, with some arbitrary padding
        editorDiv.style.width = (totalWidth - 5) + "px";
        editorDiv.style.height = (editorDiv.offsetHeight + extraHeight - 5) + "px";
       
        if(cssLinksEditor) cssLinksEditor.resize();
        if(jsLinksEditor) jsLinksEditor.resize();
    }
    dialog.addListener("resize", resizeCallback);
}


