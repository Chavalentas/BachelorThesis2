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
    
        // Step 2: Generate the function node (that checks the function parameters)
        let functionCode = this.generateCheckFunctionParametersCode(entityData, 'msg.req.query');
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'CheckFunctionParameters', x, y, flowId, functionCode, [nextNodeId]);


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
        let queryNode = this.nodeConfGen.generateDatabaseNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], provider, "", "editor");

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

    generateSetParametersCode(entityData, provider){
        switch (provider){
            case 'postgres':
                return  `var selectQuery = 'SELECT * FROM ${entityData.schema}.${entityData.name}(';\nvar functionArgs = [];\n\nif (msg.functionParameters.length > 0){\n    for (let i = 0; i < msg.functionParameters.length; i++){\n        if (msg.functionParameters[i].parameterValue !='default'){\n          functionArgs.push(\`\\'\${msg.functionParameters[i].parameterValue}\\'\`);\n        }\n    }\n}\n\nselectQuery += functionArgs.join(\",\");\nselectQuery += ');';\nmsg.query = selectQuery;\nreturn msg;`;
            case 'mssql':
                return this.generateSetParametersQueryForMssql(entityData);
            default:
                throw new Error("Unknown database provider identified!");
        }
    }

    generateSetParametersQueryForMssql(entityData){
        var keyValuePairCodes = [];
        for (let i = 0; i < entityData.parameters.length; i++){
            var keyValuePairCode = `\n\"${entityData.parameters[i].parameterName}\" : queryParameters[${i}]`;
            keyValuePairCodes.push(keyValuePairCode);
        }

        var code = `var queryParameters = [];\n\nfor (let i = 0; i < msg.functionParameters.length; i++){\n    if (msg.functionParameters[i].parameterValue == 'default'){\n        queryParameters.push('default');\n    } else{\n        queryParameters.push(\`\\'\${msg.functionParameters[i].parameterValue}\\'\`);\n    }\n}\n\nmsg.queryParameters = {${keyValuePairCodes.join(",")}\n};\n\nreturn msg;`;
        return code;
    }

    generateCheckFunctionParametersCode(entityData, prefix){
        var ifCodes = [];
        for (let i = 0; i < entityData.parameters.length; i++){
            var ifCode = `\nif (${prefix}[\'${entityData.parameters[i].parameterName}\'] == undefined){\n    throw new Error(\`The parameter ${entityData.parameters[i].parameterName} was not defined!\`);\n}\n`;
            ifCodes.push(ifCode);
        }

        var parameterPushes = [];
        for (let i = 0; i < entityData.parameters.length; i++){
            var parameterPush = `msg.functionParameters.push({\"parameterName\" : \"${entityData.parameters[i].parameterName}\", \"parameterValue\" : msg.req.query['${entityData.parameters[i].parameterName}']});`;
            parameterPushes.push(parameterPush);
        }

        var parametersInString = entityData.parameters.map(p => `\"${p.parameterName}\"`);

        var code = `var parameters = [${parametersInString.join(",")}];\nvar queryParameters = Object.getOwnPropertyNames(msg.req.query);\n\nif (queryParameters.some(p => !parameters.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query parameter detected!\");\n}\n${ifCodes.join("\n\n")}\nmsg.functionParameters = [];\n${parameterPushes.join("\n")}\n\nreturn msg;`
        return code;
    }

    generateQueryCode(entityData, provider){
        switch (provider){
            case 'postgres':
                return  ``; // The query was stored dynamically in msg.query as default values have to be left out in the parameters
            case 'mssql':
                return this.generateQueryCodeForMssql(entityData);
            default:
                throw new Error("Unknown database provider identified!");
        }
    }

    generateQueryCodeForMssql(entityData){
        var inputValueCodes = [];
        for (let i = 0; i < entityData.parameters.length; i++){
            var inputValueCode = `{{{queryParameters.${entityData.parameters[i].parameterName}}}}`;
            inputValueCodes.push(inputValueCode);
        }

        var code = `select * from ${entityData.schema}.${entityData.name}(${inputValueCodes.join(",")});`;
        return code;
    }
}

module.exports = {
    FunctionRestApiGenerator
}