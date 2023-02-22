import { Helper } from "./helper-functions.js";
import { NodeConfigGenerator } from "./node-config-generator.js";

export class TableRestApiGenerator{
    constructor(){
        this.usedids = [];
        this.nodeConfGen = new NodeConfigGenerator();
        this.helper = new Helper();
    }

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
        let getCommentId = this.helper.generateId(16, this.usedids);
        let getComment = this.nodeConfGen.generateCommentNode(getCommentId, "GetEndPoint (table attributes are query parameters)", x + 300, y, flowTabId, []);
        config.push(getComment);
        y += 50;
        let getEndPoint = this.generateGetEndPoint(entityData, dbConfigNodeId, provider, x, 250, y, flowTabId);
        y += 100;
        let postCommentId = this.helper.generateId(16, this.usedids);
        let postComment = this.nodeConfGen.generateCommentNode(postCommentId, "PostEndPoint (request body contains the attributes of the table, no request parameters)", x + 300, y, flowTabId, []);
        config.push(postComment);
        y += 50;
        let postEndPoint = this.generatePostEndPoint(entityData, dbConfigNodeId, provider, x, 250, y, flowTabId);
        y += 100;
        let putCommentId = this.helper.generateId(16, this.usedids);
        let putComment = this.nodeConfGen.generateCommentNode(putCommentId, "PutEndPoint (request body contains the attributes of the table, request parameters the primary key)", x + 300, y, flowTabId, []);
        config.push(putComment);
        y += 50;
        let putEndPoint = this.generatePutEndPoint(entityData, dbConfigNode, provider, x, 250, y, flowTabId);
        y += 100;
        let deleteCommentId = this.helper.generateId(16, this.usedids);
        let deleteComment = this.nodeConfGen.generateCommentNode(deleteCommentId, "DeleteEndPoint (no request body, request parameters contain the primary key)", x + 300, y, flowTabId, []);
        config.push(deleteComment);
        y += 50;
        let deleteEndPoint = this.generateDeleteEndPoint(entityData, dbConfigNodeId, provider, x, 250, y, flowTabId);


        // Concat the generated endpoints into the configuration
        config = config.concat(catchSublow);
        config = config.concat(getEndPoint);
        config = config.concat(postEndPoint);
        config = config.concat(putEndPoint);
        config = config.concat(deleteEndPoint);
    
        return config;
    }

    generateCatchSubFlow(startX, xOffset, startY, flowId){
        let x = startX;
        let y = startY;

        // Step 1: Generate the catch node
        let catchNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(catchNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let catchNode = this.nodeConfGen.generateCatchErrorNode(catchNodeId, null, x, y, flowId, [nextNodeId]);

        x += xOffset;

        // Step 2: Generate the create error node
        let functionCode = "// Store the error message \n// in the payload property.\nmsg.payload = msg.error;\nreturn msg;";
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, "CreateError", x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the response node
        let respondeNodeId = nextNodeId;
        let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 400, x, y, flowId);
 
        let resultingNodes = [catchNode, functionNode, responseNode];
        return resultingNodes;
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
        let functionCode = this.generateSetQueryForReadOperation(entityData, 'msg.payload');
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the function node (that creates the select query)
        let queryFunctionCode = this.generateCreateSelectQueryForReadOperation(entityData, provider);
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

       // Step 5: Create the response node (that returns the result)
       let respondeNodeId = nextNodeId;
       let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);

       let resultingNodes = [httpInNode, functionNode, queryFunctionNode, queryNode, responseNode];
       return resultingNodes;
    }

    generatePostEndPoint(entityData, dbConfigNodeId, provider, startX, xOffset, startY, flowId){
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
        let propertiesToInsert = `{${this.generateJsonPropertiesCode(entityData.properties, 'msg.payload')}\n}`;
        let functionCode = `var data = ${propertiesToInsert};\n\nmsg.queryParameters = data;\nreturn msg;`;
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the database node (that executes the query)
        let queryCode = this.generateInsertQueryCode(entityData, provider);
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generateDatabaseNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], provider, "", "editor");

        x += xOffset;

        // Step 4: Create the response node (that returns the result)
       let respondeNodeId = nextNodeId;
       let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 201, x, y, flowId);
    
       let resultingNodes = [httpInNode, functionNode, queryNode, responseNode];
       return resultingNodes;
    }
    
    generatePutEndPoint(entityData, dbConfigNodeId, provider, startX, xOffset, startY, flowId){
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
       let updateProperties = `${this.generateJsonPropertiesCode(entityData.properties, 'msg.payload')}`;
       let functionCode = `var data = {\n    pkvalue : msg.req.params.${entityData.pk},${updateProperties}\n};\n\nmsg.queryParameters = data;\nreturn msg;`;
       let functionNodeId = nextNodeId;
       nextNodeId = this.helper.generateId(16, this.usedids);
       this.usedids.push(nextNodeId);
       let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

       x += xOffset;

        // Step 3: Generate the database node (that executes the query)
        let queryCode = this.generateUpdateQueryCode(entityData, provider)
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generateDatabaseNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], provider, "", "editor");
       
        x += xOffset;

        // Step 4: Create the response node (that returns the result)
       let respondeNodeId = nextNodeId;
       let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);
    
       let resultingNodes = [httpInNode, functionNode, queryNode, responseNode];
       return resultingNodes;
    }
    
    generateDeleteEndPoint(entityData, dbConfigNodeId, provider, startX, xOffset, startY, flowId){
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
       let functionCode = `var data = {\n    pkvalue : msg.req.params.${entityData.pk}\n};\n\nmsg.queryParameters = data;\nreturn msg;`;
       let functionNodeId = nextNodeId;
       nextNodeId = this.helper.generateId(16, this.usedids);
       this.usedids.push(nextNodeId);
       let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

       x += xOffset;

        // Step 3: Generate the database node (that executes the query)
        let queryCode = this.generateDeleteQueryCode(entityData, provider);
        let queryNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.nodeConfGen.generateDatabaseNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], provider, "", "editor");

        x += xOffset;

       // Step 4: Create the response node (that returns the result)
       let respondeNodeId = nextNodeId;
       let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);

       let resultingNodes = [httpInNode, functionNode, queryNode, responseNode];
       return resultingNodes;
    }
    
    generateDeleteQueryCode(entityData, provider){
        switch (provider){
            case 'postgres':
                return `DELETE FROM ${entityData.schema}.${entityData.name} WHERE ${entityData.pk} = $pkvalue;`;
            case 'mssql':
                return `DELETE FROM ${entityData.schema}.${entityData.name} WHERE ${entityData.pk}='{{{queryParameters.pkvalue}}}';`;
            default:
                throw new Error("Unknown database provider identified!");
        }
    }

    generateInsertQueryCode(entityData, provider){
        switch (provider){
            case 'postgres':
                return this.generateInsertQueryForPostgres(entityData);
            case 'mssql':
                return this.generateInsertQueryForMssql(entityData);
            default:
                throw new Error("Unknown database provider identified!");
        }
    }
    

    generateInsertQueryForPostgres(entityData){
        var propertyNames = entityData.properties.map(p => p.propertyName);
        var propertyValues = entityData.properties.map(p => `$${p.propertyName}`);

        var query = `INSERT INTO ${entityData.schema}.${entityData.name} (${propertyNames.join(",")}) VALUES (${propertyValues.join(",")});`;
        return query;
    }

    generateInsertQueryForMssql(entityData){
        var propertyNames = entityData.properties.map(p => p.propertyName);
        var propertyValues = entityData.properties.map(p => `'{{{queryParameters.${p.propertyName}}}}'`);

        var query = `INSERT INTO ${entityData.schema}.${entityData.name} (${propertyNames.join(",")}) VALUES (${propertyValues.join(",")});`;
        return query;
    }

    generateUpdateQueryCode(entityData, provider){
        switch (provider){
            case 'postgres':
                return this.generateUpdateQueryForPostgres(entityData);
            case 'mssql':
                return this.generateUpdateQueryForMssql(entityData);
            default:
                throw new Error("Unknown database provider identified!");
        }
    }
    

    generateUpdateQueryForPostgres(entityData){
        var propertiesWithoutPk = entityData.properties.filter(function(item){
            return item.propertyName != entityData.pk;
        });

        var propertyNameValuePairs = propertiesWithoutPk.map(p => `${p.propertyName} = $${p.propertyName}`);

        var query = `UPDATE ${entityData.schema}.${entityData.name} SET ${propertyNameValuePairs.join(",")} WHERE ${entityData.pk}=$pkvalue;`;
        return query;
    }

    generateUpdateQueryForMssql(entityData){
        var propertiesWithoutPk = entityData.properties.filter(function(item){
            return item.propertyName != entityData.pk;
        });

        var propertyNameValuePairs = propertiesWithoutPk.map(p => `${p.propertyName} = '{{{queryParameters.${p.propertyName}}}}'`);

        var query = `UPDATE ${entityData.schema}.${entityData.name} SET ${propertyNameValuePairs.join(",")} WHERE ${entityData.pk}='{{{queryParameters.pkvalue}}}';`;
        return query;
    }

    generateJsonPropertiesCode(properties, prefix){
        let result = '';

        for (let i = 0; i < properties.length; i++){
            result += `\n    ${properties[i].propertyName} : ${prefix}.${properties[i].propertyName},`;
        }

        return result;
    }

    generateSetQueryForReadOperation(entityData, prefix){
        var ifCodes = [];
        for (let i = 0; i < entityData.properties.length; i++){
            var ifCode = `\nif (${prefix}.${entityData.properties[i].propertyName} != undefined){\n    msg.queryProperties.push({\"propertyName\": \"${entityData.properties[i].propertyName}\", \"propertyValue\" : \`\${${prefix}.${entityData.properties[i].propertyName}}\`});\n}\n`;
            ifCodes.push(ifCode);
        }

        var propertiesInString = entityData.properties.map(p => `\"${p.propertyName}\"`);
        var code = `msg.queryProperties = [];\nvar properties = [${propertiesInString.join(",")}];\nvar queryProperties = Object.getOwnPropertyNames(msg.req.query);\n\nif (queryProperties.some(p => !properties.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query property detected!\");\n}\n\nif (queryProperties.some(p => !properties.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query property detected!\");\n}\n${ifCodes.join("\n\n")}\n\nreturn msg;`;
        return code;
    }

    generateCreateSelectQueryForReadOperation(entityData, provider){
        switch (provider){
            case 'postgres':
                return  `var selectQuery = 'SELECT * FROM ${entityData.schema}.${entityData.name}';\nvar equations = [];\n\nif (msg.queryProperties.length > 0){\n    for (let i = 0; i < msg.queryProperties.length; i++){\n        let equation = \`\${msg.queryProperties[i].propertyName} = \'\${msg.queryProperties[i].propertyValue}\'\`;\n        equations.push(equation);\n    }\n    \n    var equationsJoined = equations.join(\" AND \");\n    selectQuery += ' WHERE ';\n    selectQuery += \`\${equationsJoined}\`;\n}\n\nselectQuery += ';';\nmsg.query = selectQuery;\nreturn msg;`;
            case 'mssql':
                return  `var selectQuery = 'SELECT * FROM ${entityData.schema}.${entityData.name}';\nvar equations = [];\n\nif (msg.queryProperties.length > 0){\n    for (let i = 0; i < msg.queryProperties.length; i++){\n        let equation = \`CONVERT(VARCHAR, \${msg.queryProperties[i].propertyName}) = \'\${msg.queryProperties[i].propertyValue}\'\`;\n        equations.push(equation);\n    }\n    \n    var equationsJoined = equations.join(\" AND \");\n    selectQuery += ' WHERE ';\n    selectQuery += \`\${equationsJoined}\`;\n}\n\nselectQuery += ';';\nmsg.query = selectQuery;\nreturn msg;`;
            default:
                throw new Error("Unknown database provider identified!");
        }
    }
}