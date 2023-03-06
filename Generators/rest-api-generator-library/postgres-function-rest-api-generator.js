const gen = require('./function-rest-api-generator.js');

const PostgresFunctionRestApiGenerator = class extends gen.FunctionRestApiGenerator{
    generate(entityData, databaseConfiguration, restApiName){
        if (this.helper.isNullOrUndefined(entityData)){
            throw new Error('The parameter entityData was null or undefined!');
        }
    
        if (this.helper.isNullOrUndefined(databaseConfiguration)){
            throw new Error('The parameter databaseConfiguration was null or undefined!');
        }
    
        if (this.helper.isNullOrUndefined(restApiName)){
            throw new Error('The parameter restApiName was null or undefined!');
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
        let dbConfigNode = this.nodeConfGen.generatePostgresqlConfigurationNode(databaseConfiguration, dbConfigNodeId);

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
        let getEndPoint = this.generateGetEndPoint(entityData, dbConfigNodeId, x, 300, y, flowTabId);

        // Concat the generated subflows into the configuration
        config = config.concat(catchSublow);
        config = config.concat(getEndPoint);
        
        return config;
    }

    generateGetEndPoint(entityData, dbConfigNodeId, startX, xOffset, startY, flowId){
        if (this.helper.isNullOrUndefined(entityData)){
            throw new Error('The parameter entityData was null or undefined!');
        }
    
        if (this.helper.isNullOrUndefined(dbConfigNodeId)){
            throw new Error('The parameter dbConfigNodeId was null or undefined!');
        }
    
        if (this.helper.isNullOrUndefined(startX)){
            throw new Error('The parameter startX was null or undefined!');
        }

        if (this.helper.isNullOrUndefined(xOffset)){
            throw new Error('The parameter xOffset was null or undefined!');
        }
    
        if (this.helper.isNullOrUndefined(startY)){
            throw new Error('The parameter startY was null or undefined!');
        }
    
        if (this.helper.isNullOrUndefined(flowId)){
            throw new Error('The parameter flowId was null or undefined!');
        }
        
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
        let queryFunctionCode = `var selectQuery = 'SELECT * FROM ${entityData.schema}.${entityData.name}(';\nvar functionArgs = [];\n\nif (msg.functionParameters.length > 0){\n    for (let i = 0; i < msg.functionParameters.length; i++){\n        if (msg.functionParameters[i].parameterValue !='default'){\n          functionArgs.push(\`\\'\${msg.functionParameters[i].parameterValue}\\'\`);\n        }\n    }\n}\n\nselectQuery += functionArgs.join(\",\");\nselectQuery += ');';\nmsg.query = selectQuery;\nreturn msg;`;
        let queryFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let queryFunctionNode = this.nodeConfGen.generateFunctionNode(queryFunctionNodeId, 'SetQueryParameters', x, y, flowId, queryFunctionCode, [nextNodeId]);

        x += xOffset;

        // Step 4: Generate the database node (that executes the query)
        let queryCode = ``; // The query was stored dynamically in msg.query as default values have to be left out in the parameters 
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generatePostgresqlNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId]);

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
}

module.exports = {
    PostgresFunctionRestApiGenerator
}