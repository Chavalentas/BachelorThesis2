const gen = require('./stored-procedure-rest-api-generator.js');

const PostgresStoredProcedureRestApiGenerator = class extends gen.StoredProcedureRestApiGenerator{
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
        let getComment = this.nodeConfGen.generateCommentNode(getCommentId, "GetEndPoint (procedure parameters are query parameters)", x + 300, y, flowTabId, []);
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
    
        // Step 2: Generate the function node (that checks the procedure parameters)
        let functionCode = `var queryParameters = Object.getOwnPropertyNames(msg.req.query);\nif (queryParameters.some(p => p != \"param\")) {\n    throw new Error(\"Invalid query parameter detected!\");\n}\n\nif (msg.req.query.param === undefined) {\n    throw new Error(\"The parameters were not defined!\");\n}\n\n\nmsg.procedureParameters = [];\nvar params = msg.req.query.param;\n\nfor (let i = 0; i < params.length; i++) {\n    msg.procedureParameters.push(params[i]);\n}\n\nreturn msg;`;
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'CheckProcedureParameters', x, y, flowId, functionCode, [nextNodeId]);


        x += xOffset;

        // Step 3: Generate the function node (that creates the procedure query)
        let queryFunctionCode = `var callProcedureQuery = 'CALL ${entityData.schema}.${entityData.name}(';\nvar queryParams = [];\n\nfor (let i = 0; i < msg.procedureParameters.length; i++){\n if (msg.procedureParameters[i] == 'default'){\n        continue;\n    }\n    \n    \n   queryParams.push(msg.procedureParameters[i]);\n}\n\ncallProcedureQuery += queryParams.join(\",\");\ncallProcedureQuery += ');';\nmsg.query = callProcedureQuery;\nreturn msg;`;
        let queryFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let queryFunctionNode = this.nodeConfGen.generateFunctionNode(queryFunctionNodeId, 'CreateProcedureQuery', x, y, flowId, queryFunctionCode, [nextNodeId]);

        x += xOffset;

        // Step 4: Generate the database node (that executes the query)
        let query = ``;
        let databaseNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let databaseNode = this.nodeConfGen.generatePostgresqlNode(databaseNodeId, 'Query', x, y, flowId, query, dbConfigNodeId, [nextNodeId]);

        x += xOffset;

        // Step 5: Generate the function node (that sets the response)
        let setResponseCode = `var response = msg.payload;\nmsg.payload = {\n  \"result\" : response  \n};\nreturn msg;`;
        let setResponseNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let setResponseFunctionNode = this.nodeConfGen.generateFunctionNode(setResponseNodeId, 'SetResponse', x, y, flowId, setResponseCode, [nextNodeId]);

        x += xOffset;

        // Step 6: Generate the response node
        let responseNodeId = nextNodeId;
        let responseNode = this.nodeConfGen.generateHttpResponseNode(responseNodeId, 200, x, y, flowId);

        let resultNodes = [httpInNode, functionNode, queryFunctionNode, databaseNode, setResponseFunctionNode, responseNode];

        return resultNodes;
    }

}

module.exports = {
    PostgresStoredProcedureRestApiGenerator
}