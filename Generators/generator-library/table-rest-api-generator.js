import { Helper } from "./helper-functions.js";
import { NodeConfigGenerator } from "./node-config-generator.js";

export class TableRestApiGenerator{
    constructor(){
        this.usedids = [];
        this.nodeConfGen = new NodeConfigGenerator();
        this.helper = new Helper();
    }

    generateRestApiForTable(tableData, databaseConfiguration, restApiName, provider){
        let config = [];
    
        // Flow tab
        let flowTabId = this.helper.generateId(16, this.usedids);
        this.usedids.push(flowTabId);
        let flowTabNode = this.nodeConfGen.generateFlowTabNode(restApiName, flowTabId);
    
        // Db config
        let dbConfigNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(dbConfigNodeId);
        let dbConfigNode = this.nodeConfGen.generateDatabaseConfigNode(databaseConfiguration, dbConfigNodeId, provider);
    
        // Start coordinates
        let startX = 150;
        let startY = 140;
        let x = startX;
        let y = startY;
    
        config.push(flowTabNode);
        config.push(dbConfigNode);

        // Subflow that catches the errors
        let catchSublow = this.generateCatchSubFlow(x, 250, y, flowTabId);
        y += 100;
        let getEndPoint = this.generateGetEndPoint(tableData, dbConfigNodeId, provider, x, 250, y, flowTabId);
        y += 100;
        let postEndPoint = this.generatePostEndPoint(tableData, dbConfigNodeId, provider, x, 250, y, flowTabId);
        y += 100;
        let putEndPoint = this.generatePutEndPoint(tableData, dbConfigNode, provider, x, 250, y, flowTabId);
        y += 100;
        let deleteEndPoint = this.generateDeleteEndPoint(tableData, dbConfigNodeId, provider, x, 250, y, flowTabId);


        // Concat the generated nodes into the configuration
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

    generateGetEndPoint(tableData, dbConfigNodeId, provider, startX, xOffset, startY, flowId){
        let x = startX;
        let y = startY;
     
        // Step 1: Generate the http in endpoint (GET request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${tableData.schema}.${tableData.name}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, 'get', x, y, flowId, [nextNodeId]);

        x += xOffset;
    
        // Step 2: Generate the function node (that sets the query parameters)
        let functionCode = this.generateSetQueryForReadOperation(tableData, 'msg.payload');
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the function node (that creates the select query)
        let queryFunctionCode = this.generateCreateSelectQueryForReadOperation(tableData, provider);
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

    generatePostEndPoint(tableData, dbConfigNodeId, provider, startX, xOffset, startY, flowId){
        let x = startX;
        let y = startY;
     
        // Step 1: Generate the http in endpoint (POST request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${tableData.schema}.${tableData.name}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, 'post', x, y, flowId, [nextNodeId]);

        x += xOffset;

        // Step 2: Generate the function node (that sets the query parameters)
        let propertiesToInsert = `{${this.generateJsonPropertiesCode(tableData.properties, 'msg.payload')}\n}`;
        let functionCode = `var data = ${propertiesToInsert};\n\nmsg.queryParameters = data;\nreturn msg;`;
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the database node (that executes the query)
        let queryCode = this.generateInsertQueryCode(tableData, provider);
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
    
    generatePutEndPoint(tableData, dbConfigNodeId, provider, startX, xOffset, startY, flowId){
        if (!tableData.properties.some(p => p.propertyName == tableData.pk)){
            throw new Error("Wrong primary key was specified!");
        }

        let x = startX;
        let y = startY;

        // Step 1: Generate the http in endpoint (DELETE request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${tableData.schema}.${tableData.name}/:${tableData.pk}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, 'put', x, y, flowId, [nextNodeId]);

        x += xOffset;

       // Step 2: Generate the function node (that sets the query parameters)
       let updateProperties = `${this.generateJsonPropertiesCode(tableData.properties, 'msg.payload')}`;
       let functionCode = `var data = {\n    pkvalue : msg.req.params.${tableData.pk},${updateProperties}\n};\n\nmsg.queryParameters = data;\nreturn msg;`;
       let functionNodeId = nextNodeId;
       nextNodeId = this.helper.generateId(16, this.usedids);
       this.usedids.push(nextNodeId);
       let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

       x += xOffset;

        // Step 3: Generate the database node (that executes the query)
        let queryCode = this.generateUpdateQueryCode(tableData, provider)
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
    
    generateDeleteEndPoint(tableData, dbConfigNodeId, provider, startX, xOffset, startY, flowId){
        if (!tableData.properties.some(p => p.propertyName == tableData.pk)){
            throw new Error("Wrong primary key was specified!");
        }

        let x = startX;
        let y = startY;
     
        // Step 1: Generate the http in endpoint (DELETE request)
        let httpInNodeId = this.helper.generateId(16, this.usedids);
        let httpInNodeUrl = `/${tableData.schema}.${tableData.name}/:${tableData.pk}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.nodeConfGen.generateHttpInNode(httpInNodeId, httpInNodeUrl, 'delete', x, y, flowId, [nextNodeId]);

        x += xOffset;

       // Step 2: Generate the function node (that sets the query parameters)
       let functionCode = `var data = {\n    pkvalue : msg.req.params.${tableData.pk}\n};\n\nmsg.queryParameters = data;\nreturn msg;`;
       let functionNodeId = nextNodeId;
       nextNodeId = this.helper.generateId(16, this.usedids);
       this.usedids.push(nextNodeId);
       let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

       x += xOffset;

        // Step 3: Generate the database node (that executes the query)
        let queryCode = this.generateDeleteQueryCode(tableData, provider);
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
    
    generateDeleteQueryCode(tableData, provider){
        switch (provider){
            case 'postgres':
                return `DELETE FROM ${tableData.schema}.${tableData.name} WHERE ${tableData.pk} = $pkvalue;`;
            case 'mssql':
                return `DELETE FROM ${tableData.schema}.${tableData.name} WHERE ${tableData.pk}='{{{queryParameters.pkvalue}}}';`;
            default:
                throw new Error("Unknown database provider identified!");
        }
    }

    generateInsertQueryCode(tableData, provider){
        switch (provider){
            case 'postgres':
                return this.generateInsertQueryForPostgres(tableData);
            case 'mssql':
                return this.generateInsertQueryForMssql(tableData);
            default:
                throw new Error("Unknown database provider identified!");
        }
    }
    

    generateInsertQueryForPostgres(tableData){
        var propertyNames = tableData.properties.map(p => p.propertyName);
        var propertyValues = tableData.properties.map(p => `$${p.propertyName}`);

        var query = `INSERT INTO ${tableData.schema}.${tableData.name} (${propertyNames.join(",")}) VALUES (${propertyValues.join(",")});`;
        return query;
    }

    generateInsertQueryForMssql(tableData){
        var propertyNames = tableData.properties.map(p => p.propertyName);
        var propertyValues = tableData.properties.map(p => `'{{{queryParameters.${p.propertyName}}}}'`);

        var query = `INSERT INTO ${tableData.schema}.${tableData.name} (${propertyNames.join(",")}) VALUES (${propertyValues.join(",")});`;
        return query;
    }

    generateUpdateQueryCode(tableData, provider){
        switch (provider){
            case 'postgres':
                return this.generateUpdateQueryForPostgres(tableData);
            case 'mssql':
                return this.generateUpdateQueryForMssql(tableData);
            default:
                throw new Error("Unknown database provider identified!");
        }
    }
    

    generateUpdateQueryForPostgres(tableData){
        var propertiesWithoutPk = tableData.properties.filter(function(item){
            return item.propertyName != tableData.pk;
        });

        var propertyNameValuePairs = propertiesWithoutPk.map(p => `${p.propertyName} = $${p.propertyName}`);

        var query = `UPDATE ${tableData.schema}.${tableData.name} SET ${propertyNameValuePairs.join(",")} WHERE ${tableData.pk}=$pkvalue;`;
        return query;
    }

    generateUpdateQueryForMssql(tableData){
        var propertiesWithoutPk = tableData.properties.filter(function(item){
            return item.propertyName != tableData.pk;
        });

        var propertyNameValuePairs = propertiesWithoutPk.map(p => `${p.propertyName} = '{{{queryParameters.${p.propertyName}}}}'`);

        var query = `UPDATE ${tableData.schema}.${tableData.name} SET ${propertyNameValuePairs.join(",")} WHERE ${tableData.pk}='{{{queryParameters.pkvalue}}}';`;
        return query;
    }

    generateJsonPropertiesCode(properties, prefix){
        let result = '';

        for (let i = 0; i < properties.length; i++){
            result += `\n    ${properties[i].propertyName} : ${prefix}.${properties[i].propertyName},`;
        }

        return result;
    }

    generateSetQueryForReadOperation(tableData, prefix){
        var ifCodes = [];
        for (let i = 0; i < tableData.properties.length; i++){
            var ifCode = `\nif (${prefix}.${tableData.properties[i].propertyName} != undefined){\n    msg.queryProperties.push({\"propertyName\": \"${tableData.properties[i].propertyName}\", \"propertyValue\" : \`\${${prefix}.${tableData.properties[i].propertyName}}\`});\n}\n`;
            ifCodes.push(ifCode);
        }

        var propertiesInString = tableData.properties.map(p => `\"${p.propertyName}\"`);
        var code = `msg.queryProperties = [];\nvar properties = [${propertiesInString.join(",")}];\nvar queryProperties = Object.getOwnPropertyNames(msg.req.query);\n\nif (queryProperties.some(p => !properties.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query property detected!\");\n}\n\nif (queryProperties.some(p => !properties.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query property detected!\");\n}\n${ifCodes.join("\n\n")}\n\nreturn msg;`;
        return code;
    }

    generateCreateSelectQueryForReadOperation(tableData, provider){
        switch (provider){
            case 'postgres':
                return  `var selectQuery = 'SELECT * FROM ${tableData.schema}.${tableData.name}';\nvar equations = [];\n\nif (msg.queryProperties.length > 0){\n    for (let i = 0; i < msg.queryProperties.length; i++){\n        let equation = \`\${msg.queryProperties[i].propertyName} = \'\${msg.queryProperties[i].propertyValue}\'\`;\n        equations.push(equation);\n    }\n    \n    var equationsJoined = equations.join(\" AND \");\n    selectQuery += ' WHERE ';\n    selectQuery += \`\${equationsJoined}\`;\n}\n\nselectQuery += ';';\nmsg.query = selectQuery;\nreturn msg;`;
            case 'mssql':
                return  `var selectQuery = 'SELECT * FROM ${tableData.schema}.${tableData.name}';\nvar equations = [];\n\nif (msg.queryProperties.length > 0){\n    for (let i = 0; i < msg.queryProperties.length; i++){\n        let equation = \`CONVERT(VARCHAR, \${msg.queryProperties[i].propertyName}) = \'\${msg.queryProperties[i].propertyValue}\'\`;\n        equations.push(equation);\n    }\n    \n    var equationsJoined = equations.join(\" AND \");\n    selectQuery += ' WHERE ';\n    selectQuery += \`\${equationsJoined}\`;\n}\n\nselectQuery += ';';\nmsg.query = selectQuery;\nreturn msg;`;
            default:
                throw new Error("Unknown database provider identified!");
        }
    }
}