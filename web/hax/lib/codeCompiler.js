  
hax.codeCompiler = {};

/** This method analyzes the code and creates the object function and dependencies. 
 * The results are loaded into the passed object processedCodeData.
 * @private */
hax.codeCompiler.processCode = function(codeInfo,codeLabel) {
    
    //analyze the code
    var combinedFunctionBody = hax.codeCompiler.createCombinedFunctionBody(
        codeInfo.argList, 
        codeInfo.functionBody, 
        codeInfo.supplementalCode, 
        codeLabel);
        
    //get the accessed variables
    //
    //parse the code and get variable dependencies
    var analyzeOutput = hax.codeAnalysis.analyzeCode(combinedFunctionBody);
    
    if(analyzeOutput.success) {
        codeInfo.varInfo = analyzeOutput.varInfo;
    }
    else {
        codeInfo.errors = analyzeOutput.errors;
        return codeInfo;
    }

    //create the object function and context setter from the code text
    var generatorFunction = hax.codeCompiler.createObjectFunction(codeInfo.varInfo, combinedFunctionBody);
    codeInfo.generatorFunction = generatorFunction;
    
    return codeInfo;   
}


/** This method creates the user code object function body. 
 * @private */
hax.codeCompiler.createCombinedFunctionBody = function(argList,
        functionBody, 
        supplementalCode,
        codeLabel) {
    
    var argListString = argList.join(",");
    
    //create the code body
    var combinedFunctionBody = hax.util.formatString(
        hax.codeCompiler.OBJECT_FUNCTION_FORMAT_TEXT,
		codeLabel,
        argListString,
        functionBody,
        supplementalCode
    );
        
    return combinedFunctionBody;
}

/** This method creates the wrapped user code object function, including the context variables. 
 * @private */
hax.codeCompiler.createObjectFunction = function(varInfo, combinedFunctionBody) {
    
    var contextDeclarationText = "";
    var contextSetterBody = "";
    
    //set the context - here we only defined the variables that are actually used.
	for(var baseName in varInfo) {
        //ignore this variable
        if(baseName == "__dh__") continue;
        
        var baseNameInfo = varInfo[baseName];
        
        //do not add context variable for local or "returnValue", which is explicitly defined
        if((baseName === "returnValue")||(baseNameInfo.isLocal)) continue;
        
        //add a declaration
        contextDeclarationText += "var " + baseName + ";\n";
        
        //add to the context setter
        contextSetterBody += baseName + ' = contextManager.getBaseData("' + baseName + '");\n';
    }
    
    //create the generator for the object function
    var generatorBody = hax.util.formatString(
        hax.codeCompiler.GENERATOR_FUNCTION_FORMAT_TEXT,
		contextDeclarationText,
        contextSetterBody,
        combinedFunctionBody
    );
        
    var generatorFunction = new Function("__dh__",generatorBody);
    return generatorFunction;    
}


/** This is the format string to create the code body for the object function
 * Input indices:
 * 0: unique member name
 * 1: function argument list with parentheses
 * 2: member formula text
 * 3: supplemental code text
 * 
 * @private
 */
hax.codeCompiler.OBJECT_FUNCTION_FORMAT_TEXT = [
"//{0}",
"",
"//supplemental code",
"{3}",
"//end supplemental code",
"",
"//member function",
"__dh__.setObjectFunction(function({1}) {",
"//overhead code",
"__dh__.initFunction();",
"",
"//user code",
"{2}",
"});",
"//end member function",
""
   ].join("\n");
   
/** This is the format string to create the code body for the object function
 * Input indices:
 * 0: context declaration text
 * 1: context setter body
 * 2: object function body
 * @private
 */
hax.codeCompiler.GENERATOR_FUNCTION_FORMAT_TEXT = [
"'use strict'",
"//declare context variables",
"{0}",
"",
"//context setter",
"__dh__.setContextSetter(function(contextManager) {",
"{1}",
"});",
"",
"//user code",
"{2}"
   ].join("\n");


