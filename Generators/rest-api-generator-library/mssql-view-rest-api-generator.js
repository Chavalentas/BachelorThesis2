const gen = require('./view-rest-api-generator.js');

const MssqlViewRestApiGenerator = class extends gen.ViewRestApiGenerator{
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
        let getComment = this.nodeConfGen.generateCommentNode(getCommentId, "GetEndPoint (view attributes are query parameters)", x + 300, y, flowTabId, []);
        config.push(getComment);
        y += 50;
        let getEndPoint = this.generateGetEndPoint(entityData, dbConfigNodeId, x, 300, y, flowTabId);
        y += 100;
        let postCommentId = this.helper.generateId(16, this.usedids);
        let postComment = this.nodeConfGen.generateCommentNode(postCommentId, "PostEndPoint (request body contains the attributes of the view, no request parameters)", x + 300, y, flowTabId, []);
        config.push(postComment);
        y += 50;
        let postEndPoint = this.generatePostEndPoint(entityData, dbConfigNodeId, x, 300, y, flowTabId);
        y += 100;
        let putCommentId = this.helper.generateId(16, this.usedids);
        let putComment = this.nodeConfGen.generateCommentNode(putCommentId, "PutEndPoint (request body contains the attributes of the view, request parameters the primary key)", x + 300, y, flowTabId, []);
        config.push(putComment);
        y += 50;
        let putEndPoint = this.generatePutEndPoint(entityData, dbConfigNodeId, x, 300, y, flowTabId);
        y += 100;
        let deleteCommentId = this.helper.generateId(16, this.usedids);
        let deleteComment = this.nodeConfGen.generateCommentNode(deleteCommentId, "DeleteEndPoint (no request body, request parameters contain the primary key)", x + 300, y, flowTabId, []);
        config.push(deleteComment);
        y += 50;
        let deleteEndPoint = this.generateDeleteEndPoint(entityData, dbConfigNodeId, x, 300, y, flowTabId);
        y += 100;
        let deleteWithQueryCommentId = this.helper.generateId(16, this.usedids);
        let deleteWithQuery = this.nodeConfGen.generateCommentNode(deleteWithQueryCommentId, "DeleteEndPoint (view attributes are query parameters)", x + 300, y, flowTabId, []);
        config.push(deleteWithQuery);
        y += 50;
        let deleteWithQueryEndPoint = this.generateDeleteEndPointWithQueryParams(entityData, dbConfigNodeId, x, 300, y, flowTabId);


        // Concat the generated subflows into the configuration
        config = config.concat(catchSublow);
        config = config.concat(getEndPoint);
        config = config.concat(postEndPoint);
        config = config.concat(putEndPoint);
        config = config.concat(deleteEndPoint);
        config = config.concat(deleteWithQueryEndPoint);
    
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
    
        // Step 2: Generate the function node (that sets the query parameters)
        let functionCode = this.generateQueryProperties(entityData, 'msg.req.query');
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the function node (that creates the select query)
        let queryFunctionCode = `var selectQuery = 'SELECT * FROM dbo.houses';\nvar equations = [];\n\nif (msg.queryProperties.length > 0){\n    for (let i = 0; i < msg.queryProperties.length; i++){\n        let equation = '';\n        \n        if (msg.queryProperties[i].propertyValue === 'null'){\n            equation = \`\${msg.queryProperties[i].propertyName} is \${msg.queryProperties[i].propertyValue}\`;\n        } else {\n            equation = \n            \`CONVERT(VARCHAR, \${msg.queryProperties[i].propertyName}) = '\${msg.queryProperties[i].propertyValue}'\`;\n        }\n        \n        equations.push(equation);\n    }\n    \n    var equationsJoined = equations.join(\" AND \");\n    selectQuery += ' WHERE ';\n    selectQuery += \`\${equationsJoined}\`;\n}\n\nselectQuery += ';';\nmsg.query = selectQuery;\nreturn msg;`;
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
        let queryNode = this.nodeConfGen.generateMssqlNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], "queryMode", "query", "query", "msg", "queryParams", "none", 0);

        x += xOffset;

        // Step 5:  Create the function node (that sets the response payload)
       let responseFunctionNodeId = nextNodeId;
       nextNodeId = this.helper.generateId(16,  this.usedids);
       let responseFunctionNode = this.nodeConfGen.generateFunctionNode(responseFunctionNodeId, 'SetResponse', x, y, flowId, 'var response = msg.payload;\nmsg.payload = {\n  \"resultSet\" : response  \n};\nreturn msg;', [nextNodeId]);
                
       x += xOffset;

       // Step 6: Create the response node (that returns the result)
       let respondeNodeId = nextNodeId;
       let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);

       let resultingNodes = [httpInNode, functionNode, queryFunctionNode, queryNode, responseFunctionNode, responseNode];
       return resultingNodes;
    }

    generatePostEndPoint(entityData, dbConfigNodeId, startX, xOffset, startY, flowId){
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
     
        // Step 1: Generate the http in endpoint (POST request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${entityData.schema}.${entityData.name}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, 'post', x, y, flowId, [nextNodeId]);

        x += xOffset;

        // Step 2: Generate the function node (that sets the query parameters)
        let propertyNames = entityData.properties.map(p => `\"${p.propertyName}\"`);
        let propertyNamesJoined = propertyNames.join(",");
        let propertiesCheck = this.generateRequestBodyPushes(entityData.properties);
        let functionCode = `msg.queryProperties = [];\nvar properties = [${propertyNamesJoined}];\nvar queryPropertyNames = Object.getOwnPropertyNames(msg.req.body);\n\nif (queryPropertyNames.some(p => !properties.some(p1 => p1 == p))) {\n    throw new Error(\"Invalid query property detected!\");\n}\n\n${propertiesCheck}\n\nreturn msg;`;
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the function node (that creates the query)
        let createQueryFunctionCode = `var insertQuery = 'INSERT INTO ${entityData.schema}.${entityData.name}';\nvar propertyNames = msg.queryProperties.map(p => p.propertyName);\nvar propertyValues = msg.queryProperties.map(p => \`\'\${p.propertyValue}\'\`);\nvar propertyNamesJoined = propertyNames.join(\",\");\nvar propertyValuesJoined = propertyValues.join(\",\");\ninsertQuery += \`(\${propertyNamesJoined})\`;\ninsertQuery += ' VALUES ';\ninsertQuery += \`(\${propertyValuesJoined})\`;\ninsertQuery += ';';\nconsole.log(insertQuery);\nmsg.query = insertQuery;\nreturn msg;`;
        let createQuerynFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let createQueryFunctionNode = this.nodeConfGen.generateFunctionNode(createQuerynFunctionNodeId, 'CreateInsertQuery', x, y, flowId, createQueryFunctionCode, [nextNodeId]);

        x += xOffset;

        // Step 4: Generate the database node (that executes the query)
        let queryCode = ``; // The query is built dynamically
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generateMssqlNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], "queryMode", "query", "query", "msg", "queryParams", "none", 0);

        x += xOffset;

        // Step 5:  Create the function node (that sets the response payload)
        let responseFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        let responseFunctionNode = this.nodeConfGen.generateFunctionNode(responseFunctionNodeId, 'SetResponse', x, y, flowId, 'msg.payload = undefined;\nreturn msg;', [nextNodeId]);
          
        x += xOffset;
  
        // Step 6: Create the response node (that returns the result)
        let respondeNodeId = nextNodeId;
        let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 201, x, y, flowId);
      
        let resultingNodes = [httpInNode, functionNode, createQueryFunctionNode, queryNode, responseFunctionNode, responseNode];
        return resultingNodes;
    }
    
    generatePutEndPoint(entityData, dbConfigNodeId, startX, xOffset, startY, flowId){
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

        if (!entityData.properties.some(p => p.propertyName == entityData.pk)){
            throw new Error("Wrong primary key was specified!");
        }

        let x = startX;
        let y = startY;

        // Step 1: Generate the http in endpoint (DELETE request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${entityData.schema}.${entityData.name}/:${entityData.pk}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, 'put', x, y, flowId, [nextNodeId]);

        x += xOffset;

       // Step 2: Generate the function node (that sets the query parameters)
       let propertyNames = entityData.properties.map(p => `\"${p.propertyName}\"`);
       let propertyNamesJoined = propertyNames.join(",");
       let propertiesCheck = this.generateRequestBodyPushes(entityData.properties);
       let functionCode = `msg.queryProperties = [];\nvar properties = [${propertyNamesJoined}];\nvar queryPropertyNames = Object.getOwnPropertyNames(msg.req.body);\n\nif (msg.req.params.${entityData.pk} === undefined){\n    throw new Error('The query parameter \\'${entityData.pk}\\' was undefined!');\n}\n\nif (queryPropertyNames.some(p => !properties.some(p1 => p1 == p))) {\n    throw new Error(\"Invalid query property detected!\");\n}\n\nmsg.pk = {\"propertyName\" : \"${entityData.pk}\", \"propertyValue\" : msg.req.params.${entityData.pk}};\n\n${propertiesCheck}\n\nreturn msg;`;
       let functionNodeId = nextNodeId;
       nextNodeId = this.helper.generateId(16, this.usedids);
       this.usedids.push(nextNodeId);
       let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

       x += xOffset;

       // Step 3: Generate the function node (that creates the query)
       let createQueryFunctionCode = `var propertyNames = msg.queryProperties.map(p => p.propertyName);\nvar propertyValues = msg.queryProperties.map(p => \`\'\${p.propertyValue}\'\`);\nvar equations = [];\n\nfor (let i = 0; i < propertyNames.length; i++){\n    var equation = \`\${propertyNames[i]} = \${propertyValues[i]}\`;\n    equations.push(equation);\n}\n\nvar equationsJoined = equations.join(\",\");\nvar updateQuery = \`UPDATE ${entityData.schema}.${entityData.name} SET \${equationsJoined} WHERE \${msg.pk.propertyName} = \${msg.pk.propertyValue};\`;\nmsg.query = updateQuery;\nreturn msg;`;
       let createQuerynFunctionNodeId = nextNodeId;
       nextNodeId = this.helper.generateId(16, this.usedids);
       this.usedids.push(nextNodeId);
       let createQueryFunctionNode = this.nodeConfGen.generateFunctionNode(createQuerynFunctionNodeId, 'CreateUpdateQuery', x, y, flowId, createQueryFunctionCode, [nextNodeId]);

       x += xOffset;

       // Step 4: Generate the database node (that executes the query)
       let queryCode = ``; // The query is built dynamically
       let queryNodeId = nextNodeId;
       nextNodeId = this.helper.generateId(16,  this.usedids);
       this.usedids.push(nextNodeId);
       let queryNode = this.nodeConfGen.generateMssqlNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], "queryMode", "query", "query", "msg", "queryParams", "none", 0);
       
        x += xOffset;

       // Step 4:  Create the function node (that sets the response payload)
       let responseFunctionNodeId = nextNodeId;
       nextNodeId = this.helper.generateId(16,  this.usedids);
       let responseFunctionNode = this.nodeConfGen.generateFunctionNode(responseFunctionNodeId, 'SetResponse', x, y, flowId, 'msg.payload = undefined;\nreturn msg;', [nextNodeId]);
                
       x += xOffset;

       // Step 5: Create the response node (that returns the result)
       let respondeNodeId = nextNodeId;
       let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);
    
       let resultingNodes = [httpInNode, functionNode, createQueryFunctionNode, queryNode, responseFunctionNode, responseNode];
       return resultingNodes;
    }
    
    generateDeleteEndPoint(entityData, dbConfigNodeId, startX, xOffset, startY, flowId){
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

        if (!entityData.properties.some(p => p.propertyName == entityData.pk)){
            throw new Error("Wrong primary key was specified!");
        }

        let x = startX;
        let y = startY;
     
        // Step 1: Generate the http in endpoint (DELETE request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${entityData.schema}.${entityData.name}/:${entityData.pk}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, 'delete', x, y, flowId, [nextNodeId]);

        x += xOffset;

       // Step 2: Generate the function node (that sets the query parameters)
       let functionCode = `if (msg.req.params.${entityData.pk} === undefined){\n    throw new Error('The query parameter \\'${entityData.pk}\\' was undefined!');\n}\n\nvar data = {\n    pkvalue : msg.req.params.${entityData.pk}\n};\n\nmsg.queryParameters = data;\nreturn msg;`;
       let functionNodeId = nextNodeId;
       nextNodeId = this.helper.generateId(16, this.usedids);
       this.usedids.push(nextNodeId);
       let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

       x += xOffset;

        // Step 3: Generate the database node (that executes the query)
        let queryCode = `DELETE FROM ${entityData.schema}.${entityData.name} WHERE ${entityData.pk}='{{{queryParameters.pkvalue}}}';`;
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generateMssqlNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], "queryMode", "query", "", "editor", "queryParams", "none", 0);

        x += xOffset;

       // Step 4:  Create the function node (that sets the response payload)
       let responseFunctionNodeId = nextNodeId;
       nextNodeId = this.helper.generateId(16,  this.usedids);
       let responseFunctionNode = this.nodeConfGen.generateFunctionNode(responseFunctionNodeId, 'SetResponse', x, y, flowId, 'msg.payload = undefined;\nreturn msg;', [nextNodeId]);
                
       x += xOffset;

       // Step 5: Create the response node (that returns the result)
       let respondeNodeId = nextNodeId;
       let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);

       let resultingNodes = [httpInNode, functionNode, queryNode, responseFunctionNode, responseNode];
       return resultingNodes;
    }

    generateDeleteEndPointWithQueryParams(entityData, dbConfigNodeId, startX, xOffset, startY, flowId){
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
     
        // Step 1: Generate the http in endpoint (DELETE request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${entityData.schema}.${entityData.name}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, 'delete', x, y, flowId, [nextNodeId]);

        x += xOffset;
    
        // Step 2: Generate the function node (that sets the query parameters)
        let functionCode = this.generateQueryProperties(entityData, 'msg.req.query');
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the function node (that creates the delete query)
        let queryFunctionCode =  `var deleteQuery = 'DELETE FROM ${entityData.schema}.${entityData.name}';\nvar equations = [];\n\nif (msg.queryProperties.length > 0){\n    for (let i = 0; i < msg.queryProperties.length; i++){\n        let equation = \`CONVERT(VARCHAR, \${msg.queryProperties[i].propertyName}) = \'\${msg.queryProperties[i].propertyValue}\'\`;\n        equations.push(equation);\n    }\n    \n    var equationsJoined = equations.join(\" AND \");\n    deleteQuery += ' WHERE ';\n    deleteQuery += \`\${equationsJoined}\`;\n}\n\deleteQuery += ';';\nmsg.query = deleteQuery;\nreturn msg;`;
        let queryFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let queryFunctionNode = this.nodeConfGen.generateFunctionNode(queryFunctionNodeId, 'CreateDeleteQuery', x, y, flowId, queryFunctionCode, [nextNodeId]);

        x += xOffset;

        // Step 4: Generate the database node (that executes the query)
        let queryCode = ``; // The query was stored in msg.query of the previous function node
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generateMssqlNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], "queryMode", "query", "query", "msg", "queryParams", "none", 0);

        x += xOffset;

        // Step 5:  Create the function node (that sets the response payload)
        let responseFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        let responseFunctionNode = this.nodeConfGen.generateFunctionNode(responseFunctionNodeId, 'SetResponse', x, y, flowId, 'msg.payload = undefined;\nreturn msg;', [nextNodeId]);
                 
        x += xOffset;
 
        // Step 6: Create the response node (that returns the result)
        let respondeNodeId = nextNodeId;
        let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);
 
        let resultingNodes = [httpInNode, functionNode, queryFunctionNode, queryNode, responseFunctionNode, responseNode];
        return resultingNodes;
    }

    generateInsertQueryCode(entityData){
        if (this.helper.isNullOrUndefined(entityData)){
            throw new Error('The parameter entityData was null or undefined!');
        }
    
        var propertyNames = entityData.properties.map(p => p.propertyName);
        var propertyValues = entityData.properties.map(p => `'{{{queryParameters.${p.propertyName}}}}'`);

        var query = `INSERT INTO ${entityData.schema}.${entityData.name} (${propertyNames.join(",")}) VALUES (${propertyValues.join(",")});`;
        return query;
    }

    generateUpdateQueryCode(entityData){
        if (this.helper.isNullOrUndefined(entityData)){
            throw new Error('The parameter entityData was null or undefined!');
        }

        var propertyNameValuePairs = entityData.properties.map(p => `${p.propertyName} = '{{{queryParameters.${p.propertyName}}}}'`);

        var query = `UPDATE ${entityData.schema}.${entityData.name} SET ${propertyNameValuePairs.join(",")} WHERE ${entityData.pk}='{{{queryParameters.pkvalue}}}';`;
        return query;
    }
}

module.exports = {
    MssqlViewRestApiGenerator
}