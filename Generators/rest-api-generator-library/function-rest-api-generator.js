const routineGen = require('./routine-rest-api-generator.js');

const FunctionRestApiGenerator = class extends routineGen.RoutineRestApiGenerator{
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
        let getComment = this.nodeConfGen.generateCommentNode(getCommentId, "GetEndPoint (function parameters are query parameters)", x + 300, y, flowTabId, []);
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
    
        // Step 2: Generate the function node (that sets the query parameters)
        let functionCode = this.generateQueryProperties(entityData, 'msg.req.query');
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);


        x += xOffset;

        // Step 3: Generate the function node (that creates the select query)
        let queryFunctionCode = this.generateCreateSelectQuery(entityData, provider);
        let queryFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let queryFunctionNode = this.nodeConfGen.generateFunctionNode(queryFunctionNodeId, 'CreateSelectQuery', x, y, flowId, queryFunctionCode, [nextNodeId]);

        x += xOffset;

        // Step 4: Generate the database node (that executes the query)
        let queryCode = ``; // The query was stored in msg.query of the previous function node
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generateDatabaseNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], provider, "query", "msg");

        x += xOffset;

        // Step 5:  Create the function node (that sets the response payload)
        let responseFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        let responseFunctionCode = this.nodeConfGen.generateFunctionNode(responseFunctionNodeId, 'SetResponse', x, y, flowId, 'var response = msg.payload;\nmsg.payload = {\n  \"resultSet\" : response  \n};\nreturn msg;', [nextNodeId]);

        x += xOffset;

       // Step 6: Create the response node (that returns the result)
       let respondeNodeId = nextNodeId;
       let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);


       let resultingNodes = [httpInNode, functionNode, queryFunctionNode, queryNode, responseFunctionCode, responseNode];
       return resultingNodes;
    }

    generateQueryProperties(entityData, prefix){
        var ifCodes = [];
        for (let i = 0; i < entityData.parameters.length; i++){
            var ifCode = `\nif (${prefix}[\'${entityData.parameters[i].parameterName}\'] != undefined){\n    msg.queryParameters.push({\"parameterName\": \"${entityData.parameters[i].parameterName}\", \"parameterValue\" : \`\${${prefix}[\'${entityData.parameters[i].parameterName}\']}\`});\n}\n`;
            ifCodes.push(ifCode);
        }

        var parametersInString = entityData.parameters.map(p => `\"${p.parameterName}\"`);
        var code = `msg.queryParameters = [];\nvar parameters = [${parametersInString.join(",")}];\nvar queryParameters = Object.getOwnPropertyNames(msg.req.query);\n\nif (queryParameters.some(p => !parameters.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query parameter detected!\");\n}\n\nif (queryParameters.some(p => !parameters.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query parameter detected!\");\n}\n${ifCodes.join("\n\n")}\n\nreturn msg;`;
        return code;
    }

    generateCreateSelectQuery(entityData, provider){
        switch (provider){
            case 'postgres':
                return  `var selectQuery = 'SELECT * FROM ${entityData.schema}.${entityData.name}(';\nvar functionArgs = [];\n\nif (msg.queryParameters.length > 0){\n    for (let i = 0; i < msg.queryParameters.length; i++){\n        if (msg.queryParameters[i].parameterValue !='default'){\n        functionArgs.push(\`\\'\${msg.queryParameters[i].parameterValue}\\'\`);\n        }\n    }\n}\n\nselectQuery += functionArgs.join(\",\");\nselectQuery += ');';\nmsg.query = selectQuery;\nreturn msg;`;
            case 'mssql':
                return  `var selectQuery = 'SELECT * FROM ${entityData.schema}.${entityData.name}(';\nvar functionArgs = [];\n\nif (msg.queryParameters.length > 0){\n    for (let i = 0; i < msg.queryParameters.length; i++){\n        if (msg.queryParameters[i].parameterValue =='default'){\n            functionArgs.push('default');\n        }\n        else{\n        functionArgs.push(\`\\'\${msg.queryParameters[i].parameterValue}\\'\`);\n        }\n    }\n}\n\nselectQuery += functionArgs.join(\",\");\nselectQuery += ');';\nmsg.query = selectQuery;\nreturn msg;`;
            default:
                throw new Error("Unknown database provider identified!");
        }
    }
}

module.exports = {
    FunctionRestApiGenerator
}