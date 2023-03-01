const routineGen = require('./routine-rest-api-generator.js');

const  StoredProcedureRestApiGenerator =  class extends routineGen.RoutineRestApiGenerator{
    generate(entityData, databaseConfiguration, restApiName, provider){
        let config = [];
    
        // Start coordinates
        let startX = 150;
        let startY = 140;
        let x = startX;
        let y = startY;

        // Flow tab
        let flowTabId = this.helper.generateId(16, this.usedids);
        this.usedids.push(flowTabId);
        let flowTabNode = this.nodeConfGen.generateFlowTabNode(restApiName, flowTabId);
    
        // Db config
        let dbConfigNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(dbConfigNodeId);
        let dbConfigNode = this.nodeConfGen.generateDatabaseConfigNode(databaseConfiguration, dbConfigNodeId, provider);

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
        let getEndPoint = this.generateGetEndPoint(entityData, dbConfigNodeId, provider, x, 300, y, flowTabId);

        // Concat the generated subflows into the configuration
        config = config.concat(catchSublow);
        config = config.concat(getEndPoint);
        
        return config;
    }

    generateGetEndPoint(entityData, dbConfigNodeId, provider, startX, xOffset, startY, flowId){
        let x = startX;
        let y = startY;
     
        // Step 1: Generate the http in endpoint (GET request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${entityData.schema}.${entityData.name}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, 'get', x, y, flowId, [nextNodeId]);


        x += xOffset;
    
        // Step 2: Generate the function node (that checks the procedure parameters)
        let functionCode = this.generateCheckProcedureParametersCode(entityData, 'msg.req.query');
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'CheckProcedureParameters', x, y, flowId, functionCode, [nextNodeId]);


        x += xOffset;

        // Step 3: Generate the function node (that sets the query parameters)
        let queryFunctionCode = this.generateSetParametersCode(entityData, provider);
        let queryFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let queryFunctionNode = this.nodeConfGen.generateFunctionNode(queryFunctionNodeId, 'SetQueryParameters', x, y, flowId, queryFunctionCode, [nextNodeId]);
     

        x += xOffset;

        // Step 4: Generate the database node (that executes the query)
        let queryCode = this.generateQueryCode(entityData, provider); 
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.generateDatabaseNode(provider, queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId]);
    

        x += xOffset;

        // Step 5:  Create the switch node (that decides based on the return value)
        let caseSuccessId = this.helper.generateId(16, this.usedids); // null or 0
        this.usedids.push(caseSuccessId);
        let caseFailId = this.helper.generateId(16, this.usedids);
        this.usedids.push(caseFailId);
        let ids = [caseSuccessId, caseSuccessId, caseFailId];
        let rule1 = {"t": "eq", "v": "0", "vt": "num"};
        let rule2 = {"t": "eq", "v": "null","vt": "str"};
        let rule3 = {"t": "else"};
        let rules = [rule1, rule2, rule3]
        let switchNode = this.nodeConfGen.generateSwitchNode(nextNodeId, 'CheckResultValue', x, y, flowId, ids, 3, 'payload.returnValue', 'msg', rules);
   
        x += xOffset;

       // Step 6: Generate the function node (that sets the response in case of success)
       let setSuccessResponseFunctionCode = `var response = msg.payload;\nmsg.payload = {\n  \"resultSet\" : response.recordset\n};\nreturn msg;`;
       let successResponseId = this.helper.generateId(16, this.usedids);
       this.usedids.push(successResponseId);
       let setSuccessResponseFunctionNode = this.nodeConfGen.generateFunctionNode(caseSuccessId, 'SetResponse', x, y - 100, flowId, setSuccessResponseFunctionCode, [successResponseId]);

        // Step 7: Generate the function node (that sets the response in case of unsuccess)
       let setUnsuccessResponseFunctionCode = `var response = msg.payload;\nmsg.payload = {\n  \"error\" : \"The operation was not successful!\"  \n};\nreturn msg;`;
       let unsuccessResponseId = this.helper.generateId(16, this.usedids);
       this.usedids.push(nextNodeId);
       let setUnuccessResponseFunctionNode = this.nodeConfGen.generateFunctionNode(caseFailId, 'SetResponse', x, y + 100, flowId, setUnsuccessResponseFunctionCode, [unsuccessResponseId]);

       x += xOffset;

        // Step 8: Create the response node (that returns the result in case of success)
        let responseNodeUnsuccess = this.nodeConfGen.generateHttpResponseNode(unsuccessResponseId, 400, x, y + 100, flowId);

        // Step 9: Create the response node (that returns the result in case of success)
        let responseNodeSuccess = this.nodeConfGen.generateHttpResponseNode(successResponseId, 200, x, y - 100, flowId);


       let resultingNodes = [httpInNode, functionNode, queryFunctionNode, queryNode, switchNode, setSuccessResponseFunctionNode, responseNodeSuccess, setUnuccessResponseFunctionNode, responseNodeUnsuccess];
       return resultingNodes;
    }

    generateCheckProcedureParametersCode(entityData, prefix){
        var ifCodes = [];
        for (let i = 0; i < entityData.parameters.length; i++){
            var ifCode = `\nif (${prefix}[\'${entityData.parameters[i].parameterName}\'] == undefined){\n    throw new Error(\`The parameter ${entityData.parameters[i].parameterName} was not defined!\`);\n}\n`;
            ifCodes.push(ifCode);
        }

        var parameterPushes = [];
        for (let i = 0; i < entityData.parameters.length; i++){
            var parameterPush = `msg.procedureParameters.push({\"parameterName\" : \"${entityData.parameters[i].parameterName}\", \"parameterValue\" : msg.req.query['${entityData.parameters[i].parameterName}']});`;
            parameterPushes.push(parameterPush);
        }

        var parametersInString = entityData.parameters.map(p => `\"${p.parameterName}\"`);

        var code = `var parameters = [${parametersInString.join(",")}];\nvar queryParameters = Object.getOwnPropertyNames(msg.req.query);\n\nif (queryParameters.some(p => !parameters.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query parameter detected!\");\n}\n${ifCodes.join("\n\n")}\nmsg.procedureParameters = [];\n${parameterPushes.join("\n")}\n\nreturn msg;`
        return code;
    }

    generateSetParametersCode(entityData, provider){
        switch (provider){
            case 'postgres':
                throw new Error('Postgres not supported!');
            case 'mssql':
                return `msg.queryParams = [];\n\nfor (let i = 0; i < msg.procedureParameters.length; i++){\n    if (msg.procedureParameters[i].parameterValue == 'default'){\n        continue;\n    }\n    \n    var paramName = msg.procedureParameters[i].parameterName;\n    \n    if (paramName[0] == '@'){\n        paramName = paramName.slice(1);\n    }\n    \n    var param = {\n      \"output\" : false,\n      \"name\" : paramName,\n      \"type\" : null,\n      \"value\" : msg.procedureParameters[i].parameterValue,\n      \"options\" : {\n          \"nullable\" : true,\n          \"primary\" : false,\n          \"identity\" : false,\n          \"readOnly\" : false\n       }\n   };\n   \n   msg.queryParams.push(param);\n}\n\nreturn msg;`;
            default:
                throw new Error("Unknown database provider identified!");
        }
    }

    generateDatabaseNode(provider, id, nodeName, x, y, flowTabId, statementCode, dbConfigId, wireIds){
        switch (provider){
            case 'postgres':
                return  this.nodeConfGen.generatePostgresqlNode(id, nodeName, x, y, flowTabId, statementCode, dbConfigId, wireIds);
            case 'mssql':
                return this.nodeConfGen.generateMssqlNode(id, nodeName, x, y, flowTabId, statementCode, dbConfigId, wireIds, "", "execute", "payload", "editor", "queryParams", "msg", 1);
            default:
                throw new Error("Unknown database provider identified!");
        }
    }

    generateQueryCode(entityData, provider){
        switch (provider){
            case 'postgres':
                throw new Error('Postgres not supported!');
            case 'mssql':
                return `${entityData.schema}.${entityData.name}`;
            default:
                throw new Error("Unknown database provider identified!");
        }
    }
}

module.exports = {
    StoredProcedureRestApiGenerator
}

