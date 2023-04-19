const gen = require('./view-rest-api-generator.js');

/**
 * Represents the REST-API generator for views in PostgreSQL.
 */
const PostgresViewRestApiGenerator = class extends gen.ViewRestApiGenerator{
    /**
     * Generates the REST-API for a PostgreSQL view based on the following parameters.
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
        let getComment = this.nodeConfGen.generateCommentNode(getCommentId, "GetEndPoint (view attributes are query parameters)", x + 300, y, flowTabId, []);
        config.push(getComment);
        y += 50;
        let getEndPoint = this.generateGetEndPoint(objectData, dbConfigNodeId, x, 300, y, flowTabId);
        y += 100;
        let postCommentId = this.helper.generateId(16, this.usedids);
        let postComment = this.nodeConfGen.generateCommentNode(postCommentId, "PostEndPoint (request body contains the attributes of the view, no request parameters)", x + 300, y, flowTabId, []);
        config.push(postComment);
        y += 50;
        let postEndPoint = this.generatePostEndPoint(objectData, dbConfigNodeId, x, 300, y, flowTabId);
        y += 100;
        let putCommentId = this.helper.generateId(16, this.usedids);
        let putComment = this.nodeConfGen.generateCommentNode(putCommentId, "PutEndPoint (request body contains the attributes of the view, request parameters the primary key)", x + 300, y, flowTabId, []);
        config.push(putComment);
        y += 50;
        let putEndPoint = this.generatePutEndPoint(objectData, dbConfigNodeId, x, 300, y, flowTabId);
        y += 100;
        let deleteCommentId = this.helper.generateId(16, this.usedids);
        let deleteComment = this.nodeConfGen.generateCommentNode(deleteCommentId, "DeleteEndPoint (no request body, request parameters contain the primary key)", x + 300, y, flowTabId, []);
        config.push(deleteComment);
        y += 50;
        let deleteEndPoint = this.generateDeleteEndPoint(objectData, dbConfigNodeId, x, 300, y, flowTabId);
        y += 100;
        let deleteWithQueryCommentId = this.helper.generateId(16, this.usedids);
        let deleteWithQuery = this.nodeConfGen.generateCommentNode(deleteWithQueryCommentId, "DeleteEndPoint (view attributes are query parameters)", x + 300, y, flowTabId, []);
        config.push(deleteWithQuery);
        y += 50;
        let deleteWithQueryEndPoint = this.generateDeleteEndPointWithQueryParams(objectData, dbConfigNodeId, x, 300, y, flowTabId);


        // Concat the generated subflows into the configuration
        config = config.concat(catchSublow);
        config = config.concat(getEndPoint);
        config = config.concat(postEndPoint);
        config = config.concat(putEndPoint);
        config = config.concat(deleteEndPoint);
        config = config.concat(deleteWithQueryEndPoint);
    
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
    
        // Step 2: Generate the function node (that sets the query parameters)
        let functionCode = this.generateQueryProperties(objectData, "msg.req.query");
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, "SetQueryParameters", x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the function node (that creates the select query)
        let queryFunctionCode = `var selectQuery = "SELECT * FROM ${objectData.schema}.${objectData.name}";\nvar equations = [];\n\nif (msg.queryProperties.length > 0){\n    for (let i = 0; i < msg.queryProperties.length; i++){\n        let equation = "";\n        \n        if (msg.queryProperties[i].propertyValue === "null"){\n            equation = \`\${msg.queryProperties[i].propertyName} is \${msg.queryProperties[i].propertyValue}\`;\n        } else {\n            equation = \`\${msg.queryProperties[i].propertyName} = '\${msg.queryProperties[i].propertyValue}'\`;\n        }\n        \n        equations.push(equation);\n    }\n    \n    var equationsJoined = equations.join(\" AND \");\n    selectQuery += " WHERE ";\n    selectQuery += \`\${equationsJoined}\`;\n}\n\nselectQuery += ";";\nmsg.query = selectQuery;\nreturn msg;`;
        let queryFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let queryFunctionNode = this.nodeConfGen.generateFunctionNode(queryFunctionNodeId, "CreateSelectQuery", x, y, flowId, queryFunctionCode, [nextNodeId]);

        x += xOffset;

        // Step 4: Generate the database node (that executes the query)
        let queryCode = ""; // The query was stored in msg.query of the previous function node
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generatePostgresqlNode(queryNodeId, "Query", x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId]);

        x += xOffset;

        // Step 5:  Create the function node (that sets the response payload)
        let responseFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        let responseFunctionNode = this.nodeConfGen.generateFunctionNode(responseFunctionNodeId, "SetResponse", x, y, flowId, "var response = msg.payload;\nmsg.payload = {\n  \"result\": response  \n};\n\nreturn msg;", [nextNodeId]);

        x += xOffset;

        // Step 6: Create the response node (that returns the result)
        let respondeNodeId = nextNodeId;
        let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);

        let resultingNodes = [httpInNode, functionNode, queryFunctionNode, queryNode, responseFunctionNode, responseNode];
        return resultingNodes;
    }

    /**
     * Generates the POST endpoint of the REST-API based on the following parameters.
     * @param {*} objectData Contains the meta information about the database object.
     * @param {*} dbConfigNodeId Contains the ID of the database configuration node.
     * @param {*} startX The start x coordinate of the first node.
     * @param {*} xOffset The x distance between the nodes.
     * @param {*} startY The start y coordinate of the first node.
     * @param {*} flowId The ID of the flow.
     * @returns Array of the nodes of the endpoint.
     */
    generatePostEndPoint(objectData, dbConfigNodeId, startX, xOffset, startY, flowId){
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
     
        // Step 1: Generate the http in endpoint (POST request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${objectData.schema}.${objectData.name}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, "post", x, y, flowId, [nextNodeId]);

        x += xOffset;

        // Step 2: Generate the function node (that sets the query parameters)
        let propertyNames = objectData.properties.map(p => `\"${p.propertyName}\"`);
        let propertyNamesJoined = propertyNames.join(",");
        let propertiesCheck = this.generateRequestBodyPushes(objectData.properties);
        let functionCode = `msg.queryProperties = [];\nvar properties = [${propertyNamesJoined}];\nvar queryPropertyNames = Object.getOwnPropertyNames(msg.req.body);\n\nif (queryPropertyNames.some(p => !properties.some(p1 => p1 == p))) {\n    throw new Error(\"Invalid query property detected!\");\n}\n\n${propertiesCheck}\n\nreturn msg;`;
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, "SetQueryParameters", x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the function node (that creates the query)
        let createQueryFunctionCode = `var insertQuery = "INSERT INTO ${objectData.schema}.${objectData.name}";\nvar propertyNames = msg.queryProperties.map(p => p.propertyName);\nvar propertyValues = [];\n\nfor (let i = 0; i < msg.queryProperties.length; i++){\n    if (msg.queryProperties[i].propertyValue === "null"){\n        propertyValues.push(msg.queryProperties[i].propertyValue);\n    } else{\n        propertyValues.push(\`\'\${msg.queryProperties[i].propertyValue}\'\`);\n    }\n}\n\nvar propertyNamesJoined = propertyNames.join(\",\");\nvar propertyValuesJoined = propertyValues.join(\",\");\ninsertQuery += \`(\${propertyNamesJoined})\`;\ninsertQuery += " VALUES ";\ninsertQuery += \`(\${propertyValuesJoined})\`;\ninsertQuery += ";";\nconsole.log(insertQuery);\nmsg.query = insertQuery;\nreturn msg;`;
        let createQuerynFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let createQueryFunctionNode = this.nodeConfGen.generateFunctionNode(createQuerynFunctionNodeId, "CreateInsertQuery", x, y, flowId, createQueryFunctionCode, [nextNodeId]);

        x += xOffset;

        // Step 4: Generate the database node (that executes the query)
        let queryCode = ""; // The query is built dynamically
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generatePostgresqlNode(queryNodeId, "Query", x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId]);

        x += xOffset;

        // Step 5:  Create the function node (that sets the response payload)
        let responseFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        let responseFunctionNode = this.nodeConfGen.generateFunctionNode(responseFunctionNodeId, "SetResponse", x, y, flowId, "msg.payload = undefined;\nreturn msg;", [nextNodeId]);
        
        x += xOffset;

        // Step 6: Create the response node (that returns the result)
        let respondeNodeId = nextNodeId;
        let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 201, x, y, flowId);
    
        let resultingNodes = [httpInNode, functionNode, createQueryFunctionNode, queryNode, responseFunctionNode, responseNode];
        return resultingNodes;
    }
    
    /**
     * Generates the PUT endpoint of the REST-API based on the following parameters.
     * @param {*} objectData Contains the meta information about the database object.
     * @param {*} dbConfigNodeId Contains the ID of the database configuration node.
     * @param {*} startX The start x coordinate of the first node.
     * @param {*} xOffset The x distance between the nodes.
     * @param {*} startY The start y coordinate of the first node.
     * @param {*} flowId The ID of the flow.
     * @returns Array of the nodes of the endpoint.
     */
    generatePutEndPoint(objectData, dbConfigNodeId, startX, xOffset, startY, flowId){
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

        if (!objectData.properties.some(p => p.propertyName == objectData.pk)){
            throw new Error("Wrong primary key was specified!");
        }

        let x = startX;
        let y = startY;

        // Step 1: Generate the http in endpoint (PUT request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${objectData.schema}.${objectData.name}/:${objectData.pk}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, "put", x, y, flowId, [nextNodeId]);

        x += xOffset;

        // Step 2: Generate the function node (that sets the query parameters)
        let propertyNames = objectData.properties.map(p => `\"${p.propertyName}\"`);
        let propertyNamesJoined = propertyNames.join(",");
        let propertiesCheck = this.generateRequestBodyPushes(objectData.properties);
        let functionCode = `msg.queryProperties = [];\nvar properties = [${propertyNamesJoined}];\nvar queryPropertyNames = Object.getOwnPropertyNames(msg.req.body);\n\nif (msg.req.params.${objectData.pk} === undefined){\n    throw new Error('The query parameter \\'${objectData.pk}\\' was undefined!');\n}\n\nif (queryPropertyNames.some(p => !properties.some(p1 => p1 == p))) {\n    throw new Error(\"Invalid query property detected!\");\n}\n\nmsg.pk = {\"propertyName\": \"${objectData.pk}\", \"propertyValue\": msg.req.params.${objectData.pk}};\n\n${propertiesCheck}\n\nreturn msg;`;
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, "SetQueryParameters", x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the function node (that creates the query)
        let createQueryFunctionCode = `var propertyNames = msg.queryProperties.map(p => p.propertyName);\nvar propertyValues = msg.queryProperties.map(p => p.propertyValue);\nvar equations = [];\n\nfor (let i = 0; i < propertyNames.length; i++){\n    var propertyValue = "";\n\n    if (propertyValues[i] === "null"){\n        propertyValue = propertyValues[i];\n    } else{\n        propertyValue = \`\'\${propertyValues[i]}\'\`;\n    }\n\n    var equation = \`\${propertyNames[i]} = \${propertyValue}\`;\n    equations.push(equation);\n}\n\nvar pk = "";\n\nif (msg.pk.propertyValue === "null"){\n    pk = msg.pk.propertyValue;\n} else{\n    pk = \`\'\${msg.pk.propertyValue}\'\`;\n}\n\nvar equationsJoined = equations.join(\",\");\nvar updateQuery = \`UPDATE ${objectData.schema}.${objectData.name} SET \${equationsJoined} WHERE \${msg.pk.propertyName} = \${pk};\`;\nmsg.query = updateQuery;\nreturn msg;`;
        let createQuerynFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let createQueryFunctionNode = this.nodeConfGen.generateFunctionNode(createQuerynFunctionNodeId, "CreateUpdateQuery", x, y, flowId, createQueryFunctionCode, [nextNodeId]);

        x += xOffset;

        // Step 4: Generate the database node (that executes the query)
        let queryCode = "";  // The query is built dynamically
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generatePostgresqlNode(queryNodeId, "Query", x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId]);
       
        x += xOffset;

        // Step 5:  Create the function node (that sets the response payload)
        let responseFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        let responseFunctionNode = this.nodeConfGen.generateFunctionNode(responseFunctionNodeId, "SetResponse", x, y, flowId, "msg.payload = undefined;\nreturn msg;", [nextNodeId]);
                
        x += xOffset;

        // Step 6: Create the response node (that returns the result)
        let respondeNodeId = nextNodeId;
        let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);
    
        let resultingNodes = [httpInNode, functionNode, createQueryFunctionNode, queryNode, responseFunctionNode, responseNode];
        return resultingNodes;
    }
    
    /**
     * Generates the DELETE endpoint of the REST-API based on the following parameters.
     * @param {*} objectData Contains the meta information about the database object.
     * @param {*} dbConfigNodeId Contains the ID of the database configuration node.
     * @param {*} startX The start x coordinate of the first node.
     * @param {*} xOffset The x distance between the nodes.
     * @param {*} startY The start y coordinate of the first node.
     * @param {*} flowId The ID of the flow.
     * @returns Array of the nodes of the endpoint.
     */
    generateDeleteEndPoint(objectData, dbConfigNodeId, startX, xOffset, startY, flowId){
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

        if (!objectData.properties.some(p => p.propertyName == objectData.pk)){
            throw new Error("Wrong primary key was specified!");
        }

        let x = startX;
        let y = startY;
     
        // Step 1: Generate the http in endpoint (DELETE request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${objectData.schema}.${objectData.name}/:${objectData.pk}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, "delete", x, y, flowId, [nextNodeId]);

        x += xOffset;

        // Step 2: Generate the function node (that sets the query parameters)
        let functionCode = `if (msg.req.params.${objectData.pk} === undefined){\n    throw new Error("The query parameter \\'${objectData.pk}\\' was undefined!");\n}\n\nvar pkValue = "";\n\nif (msg.req.params.${objectData.pk} === "null"){\n    pkValue = null;\n} else{\n    pkValue = msg.req.params.${objectData.pk};\n}\n\nvar data = {\n    pk: pkValue\n};\n\nmsg.queryParameters = data;\nreturn msg;`;
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, "SetQueryParameters", x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the database node (that executes the query)
        let queryCode = `DELETE FROM ${objectData.schema}.${objectData.name} WHERE ${objectData.pk} = $pk;`;
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generatePostgresqlNode(queryNodeId, "Query", x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId]);

        x += xOffset;

        // Step 4:  Create the function node (that sets the response payload)
        let responseFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        let responseFunctionNode = this.nodeConfGen.generateFunctionNode(responseFunctionNodeId, "SetResponse", x, y, flowId, "msg.payload = undefined;\nreturn msg;", [nextNodeId]);
                
        x += xOffset;

        // Step 5: Create the response node (that returns the result)
        let respondeNodeId = nextNodeId;
        let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);

        let resultingNodes = [httpInNode, functionNode, queryNode, responseFunctionNode, responseNode];
        return resultingNodes;
    }

    /**
     * Generates the DELETE endpoint with query parameters of the REST-API based on the following parameters.
     * @param {*} objectData Contains the meta information about the database object.
     * @param {*} dbConfigNodeId Contains the ID of the database configuration node.
     * @param {*} startX The start x coordinate of the first node.
     * @param {*} xOffset The x distance between the nodes.
     * @param {*} startY The start y coordinate of the first node.
     * @param {*} flowId The ID of the flow.
     * @returns Array of the nodes of the endpoint.
     */
    generateDeleteEndPointWithQueryParams(objectData, dbConfigNodeId, startX, xOffset, startY, flowId){
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
     
        // Step 1: Generate the http in endpoint (DELETE request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${objectData.schema}.${objectData.name}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, "delete", x, y, flowId, [nextNodeId]);

        x += xOffset;
    
        // Step 2: Generate the function node (that sets the query parameters)
        let functionCode = this.generateQueryProperties(objectData, "msg.req.query");
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, "SetQueryParameters", x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the function node (that creates the delete query)
        let queryFunctionCode = `var deleteQuery = "DELETE FROM ${objectData.schema}.${objectData.name}";\nvar equations = [];\n\nif (msg.queryProperties.length > 0){\n    for (let i = 0; i < msg.queryProperties.length; i++){\n        let equation = '';\n        \n        if (msg.queryProperties[i].propertyValue === "null"){\n            equation = \`\${msg.queryProperties[i].propertyName} is \${msg.queryProperties[i].propertyValue}\`;\n        } else {\n            equation = \`\${msg.queryProperties[i].propertyName} = '\${msg.queryProperties[i].propertyValue}'\`;\n        }\n        \n        equations.push(equation);\n    }\n    \n    var equationsJoined = equations.join(\" AND \");\n    deleteQuery += " WHERE ";\n    deleteQuery += \`\${equationsJoined}\`;\n}\n\ndeleteQuery += ";";\nmsg.query = deleteQuery;\nreturn msg;`;
        let queryFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let queryFunctionNode = this.nodeConfGen.generateFunctionNode(queryFunctionNodeId, "CreateDeleteQuery", x, y, flowId, queryFunctionCode, [nextNodeId]);

        x += xOffset;

        // Step 4: Generate the database node (that executes the query)
        let queryCode = ""; // The query was stored in msg.query of the previous function node
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generatePostgresqlNode(queryNodeId, "Query", x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId]);

        x += xOffset;

        // Step 5:  Create the function node (that sets the response payload)
        let responseFunctionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        let responseFunctionNode = this.nodeConfGen.generateFunctionNode(responseFunctionNodeId, "SetResponse", x, y, flowId, "msg.payload = undefined;\nreturn msg;", [nextNodeId]);
                
        x += xOffset;

        // Step 6: Create the response node (that returns the result)
        let respondeNodeId = nextNodeId;
        let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);

        let resultingNodes = [httpInNode, functionNode, queryFunctionNode, queryNode, responseFunctionNode, responseNode];
        return resultingNodes;
    }
}

module.exports = {
    PostgresViewRestApiGenerator
}