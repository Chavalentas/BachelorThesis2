const gen = require('./stored-procedure-rest-api-generator.js');

/**
 * Represents the REST-API generator for stored procedures in MSSQL.
 */
const MssqlStoredProcedureRestApiGenerator = class extends gen.StoredProcedureRestApiGenerator{
    /**
     * Generates the REST-API for a MSSQL stored procedure based on the following parameters.
     * @param {*} objectData Contains the meta information about the database object.
     * @param {*} databaseConfiguration Contains the information that is necessary for the establishment of database connection.
     * @param {*} restApiName Contains the name of the REST-API.
     * @returns The JSON configuration of the generated flow.
     */
    generate(objectData, databaseConfiguration, restApiName){
        if (this.helper.isNullOrUndefined(objectData)){
            throw new Error("The parameter objectData was null or undefined!");
        }
    
        if (this.helper.isNullOrUndefined(databaseConfiguration)){
            throw new Error("The parameter databaseConfiguration was null or undefined!");
        }
    
        if (this.helper.isNullOrUndefined(restApiName)){
            throw new Error("The parameter restApiName was null or undefined!");
        }

        let config = [];
    
        // Start coordinates
        let x = this.startX;
        let y = this.startY;

        // Flow tab
        let flowTabId = this.helper.generateId(16, this.usedids);
        this.usedids.push(flowTabId);
        let flowTabNode = this.nodeConfGen.generateFlowTabNode(restApiName, flowTabId);
    
        // Db config
        let dbConfigNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(dbConfigNodeId);
        let dbConfigNode = this.nodeConfGen.generateMssqlConfigurationNode(databaseConfiguration, dbConfigNodeId);

        // Header
        let headerCommentId = this.helper.generateId(16, this.usedids);
        let headerComment = this.nodeConfGen.generateCommentNode(headerCommentId, restApiName, x + 300, y, flowTabId, []);
    
        config.push(headerComment);
        config.push(flowTabNode);
        config.push(dbConfigNode);

        y += 100;

        // Subflow that catches the errors
        let catchCommentId = this.helper.generateId(16, this.usedids);
        let catchComment = this.nodeConfGen.generateCommentNode(catchCommentId, "This subflow catches the errors", x + 300, y, flowTabId, []);
        config.push(catchComment);
        y += 50;
        let catchSublow = this.generateCatchSubFlow(x, 250, y, flowTabId);
        y += 100;

        // The endpoints
        let getCommentId = this.helper.generateId(16, this.usedids);
        let getComment = this.nodeConfGen.generateCommentNode(getCommentId, "GetEndPoint (procedure parameters are query parameters)", x + 300, y, flowTabId, []);
        config.push(getComment);
        y += 50;
        let getEndPoint = this.generateGetEndPoint(objectData, dbConfigNodeId, x, 300, y, flowTabId);

        // Concat the generated subflows into the configuration
        config = config.concat(catchSublow);
        config = config.concat(getEndPoint);
        
        return config;
    }

    /**
     * Generates the GET endpoint of the REST-API based on the following parameters.
     * @param {*} objectData Contains the meta information about the database object.
     * @param {*} dbConfigNodeId Contains the ID of the database configuration node.
     * @param {*} startX The start x coordinate of the first node.
     * @param {*} xOffset The x distance between the nodes.
     * @param {*} startY The start y coordinate of the first node.
     * @param {*} flowId The ID of the flow.
     * @returns Array of the nodes of the endpoint.
     */
    generateGetEndPoint(objectData, dbConfigNodeId, startX, xOffset, startY, flowId){
        if (this.helper.isNullOrUndefined(objectData)){
            throw new Error("The parameter objectData was null or undefined!");
        }
    
        if (this.helper.isNullOrUndefined(dbConfigNodeId)){
            throw new Error("The parameter dbConfigNodeId was null or undefined!");
        }
    
        if (this.helper.isNullOrUndefined(startX)){
            throw new Error("The parameter startX was null or undefined!");
        }

        if (this.helper.isNullOrUndefined(xOffset)){
            throw new Error("The parameter xOffset was null or undefined!");
        }
    
        if (this.helper.isNullOrUndefined(startY)){
            throw new Error("The parameter startY was null or undefined!");
        }
    
        if (this.helper.isNullOrUndefined(flowId)){
            throw new Error("The parameter flowId was null or undefined!");
        }
        
        let x = startX;
        let y = startY;
     
        // Step 1: Generate the http in endpoint (GET request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${objectData.schema}.${objectData.name}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, "get", x, y, flowId, [nextNodeId]);

        x += xOffset;
    
        // Step 2: Generate the function node (that checks the procedure parameters)
        let functionCode = "var queryParameters = Object.getOwnPropertyNames(msg.req.query);\n\nif (queryParameters.some(p => p != \"param\")) {\n    throw new Error(\"Invalid query parameter detected!\");\n}\n\nif (msg.req.query.param === undefined) {\n    throw new Error(\"The parameters were not defined!\");\n}\n\nmsg.procedureParameters = [];\nvar params = msg.req.query.param;\n\nfor (let i = 0; i < params.length; i++) {\n    msg.procedureParameters.push(params[i]);\n}\n\nreturn msg;";
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, "CheckProcedureParameters", x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the function node (that sets the query parameters to retrieve the parameter names of the stored procedure)
        let paramFunctionCode = `msg.queryParameters = {\n    \"schema\": "${objectData.schema}",\n    \"procName\": "${objectData.name}"\n};\n\nreturn msg;`;
        let paramFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let paramFunctionNode = this.nodeConfGen.generateFunctionNode(paramFunctionNodeId, "SetQueryParametersForMetadata", x, y, flowId, paramFunctionCode, [nextNodeId]);
        
        x += xOffset;

        // Step 4: Generate the database node (that gets the parameters of the procedure)
        let parametersQueryCode = "SELECT parameter_name\r\nFROM information_schema.routines r\r\nINNER JOIN information_schema.parameters p\r\nON p.specific_name = r.routine_name\r\nWHERE r.routine_schema = '{{{queryParameters.schema}}}'\r\nAND r.routine_type = 'PROCEDURE'\r\nAND p.parameter_mode <> 'OUT'\r\nAND r.specific_name = '{{{queryParameters.procName}}}'";
        let parametersQueryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let parametersQueryNode = this.nodeConfGen.generateMssqlNode(parametersQueryNodeId, "ProcParametersQuery", x, y, flowId, parametersQueryCode, dbConfigNodeId, [nextNodeId], "queryMode", "query", "", "editor", "queryParams", "none", 0);

        x += xOffset;

        // Step 5: Generate the function node (that sets the names of the procedure parameters)
        let paramNamesFunctionCode = "msg.paramNames = [];\n\nfor (let i = 0; i < msg.payload.length; i++) {\n    var paramName = msg.payload[i].parameter_name;\n\n    if (paramName[0] == '@') {\n        paramName = paramName.slice(1);\n    }\n\n    msg.paramNames.push(paramName);\n}\n\nreturn msg;";
        let paramNamesFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let paramNamesFunctionNode = this.nodeConfGen.generateFunctionNode(paramNamesFunctionNodeId, "SetProcParameterNames", x, y, flowId, paramNamesFunctionCode, [nextNodeId]);

        x += xOffset;

        // Step 6: Generate the function node (that sets the parameters for the final procedure execution)
        let procParamsCode =  "msg.queryParams = [];\n\nfor (let i = 0; i < msg.procedureParameters.length; i++){\n    if (msg.procedureParameters[i] === \"default\"){\n        continue;\n    }\n    \n    var value = msg.procedureParameters[i];\n\n    if (value === \"null\"){\n        value = null;\n    }\n    \n    var param = {\n      \"output\": false,\n      \"name\": msg.paramNames[i],\n      \"type\": null,\n      \"value\": value,\n      \"options\": {\n          \"nullable\": true,\n          \"primary\": false,\n          \"identity\": false,\n          \"readOnly\": false\n       }\n   };\n   \n   msg.queryParams.push(param);\n}\n\nreturn msg;";
        let procParamsCodeNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let procParamsCodeNode = this.nodeConfGen.generateFunctionNode(procParamsCodeNodeId, "SetParametersForProcedureQuery", x, y, flowId, procParamsCode, [nextNodeId]);

        x += xOffset;

        // Step 7: Generate the database node (that executes the query)
        let queryCode = `${objectData.schema}.${objectData.name}`;
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generateMssqlNode(queryNodeId, "Query", x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], "", "execute", "payload", "editor", "queryParams", "msg", 1);

        x += xOffset;

        // Step 8:  Create the switch node (that decides based on the return value)
        let caseSuccessId = this.helper.generateId(16, this.usedids); // null or 0
        this.usedids.push(caseSuccessId);
        let caseFailId = this.helper.generateId(16, this.usedids);
        this.usedids.push(caseFailId);
        let ids = [caseSuccessId, caseSuccessId, caseFailId];
        let rule1 = {"t": "eq", "v": "0", "vt": "num"};
        let rule2 = {"t": "null"};
        let rule3 = {"t": "else"};
        let rules = [rule1, rule2, rule3]
        let switchNode = this.nodeConfGen.generateSwitchNode(nextNodeId, "CheckReturnValue", x, y, flowId, ids, 3, "payload.returnValue", "msg", rules);
   
        x += xOffset;

        // Step 9: Generate the function node (that sets the response in case of success)
        let setSuccessResponseFunctionCode = "var response = msg.payload;\nmsg.payload = {\n  \"result\": response.recordsets\n};\n\nreturn msg;";
        let successResponseId = this.helper.generateId(16, this.usedids);
        this.usedids.push(successResponseId);
        let setSuccessResponseFunctionNode = this.nodeConfGen.generateFunctionNode(caseSuccessId, "SetResponse", x, y - 100, flowId, setSuccessResponseFunctionCode, [successResponseId]);

        // Step 10: Generate the function node (that sets the response in case of unsuccess)
        let setUnsuccessResponseFunctionCode = "var response = msg.payload;\nmsg.payload = {\n  \"result\": response.recordsets\n};\n\nreturn msg;";
        let unsuccessResponseId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let setUnuccessResponseFunctionNode = this.nodeConfGen.generateFunctionNode(caseFailId, "SetResponse", x, y + 100, flowId, setUnsuccessResponseFunctionCode, [unsuccessResponseId]);

        x += xOffset;

        // Step 11: Create the response node (that returns the result in case of success)
        let responseNodeUnsuccess = this.nodeConfGen.generateHttpResponseNode(unsuccessResponseId, 400, x, y + 100, flowId);

        // Step 12: Create the response node (that returns the result in case of success)
        let responseNodeSuccess = this.nodeConfGen.generateHttpResponseNode(successResponseId, 200, x, y - 100, flowId);

        let resultingNodes = [httpInNode, functionNode, paramFunctionNode, parametersQueryNode, paramNamesFunctionNode, procParamsCodeNode, queryNode, switchNode, setSuccessResponseFunctionNode, responseNodeSuccess, setUnuccessResponseFunctionNode, responseNodeUnsuccess];
        return resultingNodes;
    }
}

module.exports = {
    MssqlStoredProcedureRestApiGenerator
}