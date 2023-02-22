class TableRestApiGenerator{
    constructor(){
        this.usedids = [];
    }

    generateRestApiForTable(tableData, databaseConfiguration, restApiName, provider){
        let config = [];
    
        // Flow tab
        let flowTabId = this.generateId(16, this.usedids);
        this.usedids.push(flowTabId);
        let flowTabNode = this.generateFlowTabNode(restApiName, flowTabId);
    
        // Db config
        let dbConfigNodeId = this.generateId(16, this.usedids);
        this.usedids.push(dbConfigNodeId);
        let dbConfigNode = this.generateDatabaseConfigNode(databaseConfiguration, dbConfigNodeId, provider);
    
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
        let catchNodeId = this.generateId(16, this.usedids);
        this.usedids.push(catchNodeId);
        let nextNodeId = this.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let catchNode = this.generateCatchErrorNode(catchNodeId, null, x, y, flowId, [nextNodeId]);

        x += xOffset;

        // Step 2: Generate the create error node
        let functionCode = "// Store the error message \n// in the payload property.\nmsg.payload = msg.error;\nreturn msg;";
        let functionNodeId = nextNodeId;
        nextNodeId = this.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.generateFunctionNode(functionNodeId, "CreateError", x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the response node
        let respondeNodeId = nextNodeId;
        let responseNode = this.generateHttpResponseNode(respondeNodeId, 400, x, y, flowId);
 
        let resultingNodes = [catchNode, functionNode, responseNode];
        return resultingNodes;
    }

    generateGetEndPoint(tableData, dbConfigNodeId, provider, startX, xOffset, startY, flowId){
        let x = startX;
        let y = startY;
     
        // Step 1: Generate the http in endpoint (GET request)
        let httpInNodeId = this.generateId(16, this.usedids);
        let httpInNodeUrl = `/${tableData.schema}.${tableData.name}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.generateHttpInNode(httpInNodeId, httpInNodeUrl, 'get', x, y, flowId, [nextNodeId]);

        x += xOffset;
    
        // Step 2: Generate the function node (that sets the query parameters)
        let functionCode = this.generateSetQueryForReadOperation(tableData, 'msg.payload');
        let functionNodeId = nextNodeId;
        nextNodeId = this.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the function node (that creates the select query)
        let queryFunctionCode = this.generateCreateSelectQueryForReadOperation(tableData, provider);
        let queryFunctionNodeId = nextNodeId;
        nextNodeId = this.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let queryFunctionNode = this.generateFunctionNode(queryFunctionNodeId, 'CreateSelectQuery', x, y, flowId, queryFunctionCode, [nextNodeId]);

        x += xOffset;

        // Step 4: Generate the database node (that executes the query)
        let queryCode = ``; // The query was stored in msg.query of the previous function node
        let queryNodeId = nextNodeId;
        nextNodeId = this.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.generateDatabaseNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], provider, "query", "msg");

        x += xOffset;

       // Step 5: Create the response node (that returns the result)
       let respondeNodeId = nextNodeId;
       let responseNode = this.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);

       let resultingNodes = [httpInNode, functionNode, queryFunctionNode, queryNode, responseNode];
       return resultingNodes;
    }

    generatePostEndPoint(tableData, dbConfigNodeId, provider, startX, xOffset, startY, flowId){
        let x = startX;
        let y = startY;
     
        // Step 1: Generate the http in endpoint (POST request)
        let httpInNodeId = this.generateId(16, this.usedids);
        let httpInNodeUrl = `/${tableData.schema}.${tableData.name}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.generateHttpInNode(httpInNodeId, httpInNodeUrl, 'post', x, y, flowId, [nextNodeId]);

        x += xOffset;

        // Step 2: Generate the function node (that sets the query parameters)
        let propertiesToInsert = `{${this.generateJsonPropertiesCode(tableData.properties, 'msg.payload')}\n}`;
        let functionCode = `var data = ${propertiesToInsert};\n\nmsg.queryParameters = data;\nreturn msg;`;
        let functionNodeId = nextNodeId;
        nextNodeId = this.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the database node (that executes the query)
        let queryCode = this.generateInsertQueryCode(tableData, provider);
        let queryNodeId = nextNodeId;
        nextNodeId = this.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.generateDatabaseNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], provider, "", "editor");

        x += xOffset;

        // Step 4: Create the response node (that returns the result)
       let respondeNodeId = nextNodeId;
       let responseNode = this.generateHttpResponseNode(respondeNodeId, 201, x, y, flowId);
    
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
        let httpInNodeId = this.generateId(16, this.usedids);
        let httpInNodeUrl = `/${tableData.schema}.${tableData.name}/:${tableData.pk}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.generateHttpInNode(httpInNodeId, httpInNodeUrl, 'put', x, y, flowId, [nextNodeId]);

        x += xOffset;

       // Step 2: Generate the function node (that sets the query parameters)
       let updateProperties = `${this.generateJsonPropertiesCode(tableData.properties, 'msg.payload')}`;
       let functionCode = `var data = {\n    pkvalue : msg.req.params.${tableData.pk},${updateProperties}\n};\n\nmsg.queryParameters = data;\nreturn msg;`;
       let functionNodeId = nextNodeId;
       nextNodeId = this.generateId(16, this.usedids);
       this.usedids.push(nextNodeId);
       let functionNode = this.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

       x += xOffset;

        // Step 3: Generate the database node (that executes the query)
        let queryCode = this.generateUpdateQueryCode(tableData, provider)
        let queryNodeId = nextNodeId;
        nextNodeId = this.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.generateDatabaseNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], provider, "", "editor");
       
        x += xOffset;

        // Step 4: Create the response node (that returns the result)
       let respondeNodeId = nextNodeId;
       let responseNode = this.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);
    
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
        let httpInNodeId = this.generateId(16, this.usedids);
        let httpInNodeUrl = `/${tableData.schema}.${tableData.name}/:${tableData.pk}`;
        this.usedids.push(httpInNodeId);
        let nextNodeId = this.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let httpInNode = this.generateHttpInNode(httpInNodeId, httpInNodeUrl, 'delete', x, y, flowId, [nextNodeId]);

        x += xOffset;

       // Step 2: Generate the function node (that sets the query parameters)
       let functionCode = `var data = {\n    pkvalue : msg.req.params.${tableData.pk}\n};\n\nmsg.queryParameters = data;\nreturn msg;`;
       let functionNodeId = nextNodeId;
       nextNodeId = this.generateId(16, this.usedids);
       this.usedids.push(nextNodeId);
       let functionNode = this.generateFunctionNode(functionNodeId, 'SetQueryParameters', x, y, flowId, functionCode, [nextNodeId]);

       x += xOffset;

        // Step 3: Generate the database node (that executes the query)
        let queryCode = this.generateDeleteQueryCode(tableData, provider);
        let queryNodeId = nextNodeId;
        nextNodeId = this.generateId(16,  this.usedids);
        this.usedids.push(nextNodeId);
        let queryNode = this.generateDatabaseNode(queryNodeId, 'Query', x, y, flowId, queryCode, dbConfigNodeId, [nextNodeId], provider, "", "editor");

        x += xOffset;

       // Step 4: Create the response node (that returns the result)
       let respondeNodeId = nextNodeId;
       let responseNode = this.generateHttpResponseNode(respondeNodeId, 200, x, y, flowId);

       let resultingNodes = [httpInNode, functionNode, queryNode, responseNode];
       return resultingNodes;
    }
    
    
    generatePostgresqlConfigurationNode(databaseConfiguration, id){
        let nodeConfig = {
            "id": id,
            "type": "postgreSQLConfig",
            "name": "",
            "host": databaseConfiguration.host,
            "hostFieldType": "str",
            "port": databaseConfiguration.port,
            "portFieldType": "num",
            "database": databaseConfiguration.database,
            "databaseFieldType": "str",
            "ssl": "false",
            "sslFieldType": "bool",
            "applicationName": "",
            "applicationNameType": "str",
            "max": "10",
            "maxFieldType": "num",
            "idle": "1000",
            "idleFieldType": "num",
            "connectionTimeout": "10000",
            "connectionTimeoutFieldType": "num",
            "user": databaseConfiguration.user,
            "userFieldType": "str",
            "password": databaseConfiguration.password,
            "passwordFieldType": "str"
        };
    
        return nodeConfig;
    }
    
    generateMssqlConfigurationNode(databaseConfiguration, id){
        let nodeConfig =   {
        "id": id,
        "type": "MSSQL-CN",
        "name": "",
        "server": databaseConfiguration.host,
        "port": databaseConfiguration.port,
        "encyption": false,
        "trustServerCertificate": false,
        "database": databaseConfiguration.database,
        "useUTC": false,
        "connectTimeout": "",
        "requestTimeout": "",
        "cancelTimeout": "",
        "pool": "",
        "parseJSON": false,
        "enableArithAbort": true,
        "credentials": {
            "username": databaseConfiguration.user,
            "password": databaseConfiguration.password,
            "domain": ""
        }
    }
    
        return nodeConfig;
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
    
    generateId(length, except){
        var id = "";
    
        do {
           for (let i = 0; i < length; i++){
               // 0 false -> letter, 1 true
               let shouldBeNumber = this.getRandomInt(0, 2);
    
               if (shouldBeNumber){
                   id += this.getRandomInt(0, 10);
               } else{
                   id += String.fromCharCode(this.getRandomInt(97,123));
               }
           }
       } while (except.includes(id));
    
        return id;
    }
    
    generateFlowTabNode(flowTabName, id){
        var tabConfig = {
            "id": id,
            "type": "tab",
            "label": flowTabName,
            "disabled": false,
            "info": "",
            "env": []
        };
    
        return tabConfig;
    }
    
    generateFunctionNode(id, functionName, x, y, flowTabId, functionCode, wireIds){
        var functionNodeConfig =  {
            "id": id,
            "type": "function",
            "z": flowTabId,
            "name": functionName,
            "func": functionCode,
            "outputs": 1,
            "noerr": 0,
            "initialize": "",
            "finalize": "",
            "libs": [],
            "x": x,
            "y": y,
            "wires": this.getWires(wireIds)
        };
    
        return functionNodeConfig;
    }
    
    generatePostgresqlNode(id, nodeName, x, y, flowTabId, statementCode, dbConfigId, wireIds){
        var postgresqlNodeConfig = {
            "id": id,
            "type": "postgresql",
            "z": flowTabId,
            "name": nodeName,
            "query": statementCode,
            "postgreSQLConfig": dbConfigId,
            "split": false,
            "rowsPerMsg": 1,
            "outputs": 1,
            "x": x,
            "y": y,
            "wires": this.getWires(wireIds)
        };
    
        return postgresqlNodeConfig;
    }
    
    generateMssqlNode(id, nodeName, x, y, flowTabId, statementCode, dbConfigId, wireIds, queryOpt, queryOptType){
        var msSqlNodeConfig = {
            "id": id,
            "type": "MSSQL",
            "z": flowTabId,
            "mssqlCN": dbConfigId,
            "name": nodeName,
            "outField": "payload",
            "returnType": 0,
            "throwErrors": 1,
            "query": statementCode,
            "modeOpt": "queryMode",
            "modeOptType": "query",
            "queryOpt": queryOpt,
            "queryOptType": queryOptType,
            "paramsOpt": "queryParams",
            "paramsOptType": "none",
            "rows": "rows",
            "rowsType": "msg",
            "parseMustache": true,
            "params": [],
            "x": x,
            "y": y,
            "wires": this.getWires(wireIds)
        }
    
        return msSqlNodeConfig;
    }
    
    generateDatabaseNode(id, nodename, x, y, flowTabId, statementCode, dbConfigId, wireIds, provider, queryOpt = "", queryOptType = ""){    
        switch (provider){
            case 'postgres':
                return this.generatePostgresqlNode(id, nodename, x, y, flowTabId, statementCode, dbConfigId, wireIds);
            case 'mssql':
                return this.generateMssqlNode(id, nodename, x, y, flowTabId, statementCode, dbConfigId, wireIds, queryOpt, queryOptType);
            default:
                throw new Error("Unknown database provider identified!");
        }
    }
    
    generateDatabaseConfigNode(databaseConfiguration, id, provider){
        switch (provider){
            case 'postgres':
                return this.generatePostgresqlConfigurationNode(databaseConfiguration, id);
            case 'mssql':
                return this.generateMssqlConfigurationNode(databaseConfiguration, id);
            default:
                throw new Error("Unknown database provider identified!");
        }
    }

    generateCatchErrorNode(id, scope, x, y, flowTabId, wireIds){
        var catchErrorNode = {
            "id": id,
            "type": "catch",
            "z": flowTabId,
            "name": "",
            "scope": scope,
            "uncaught": false,
            "x": x,
            "y": y,
            "wires": this.getWires(wireIds)
        };
    
        return catchErrorNode;
    }
    
    generateHttpInNode(id, url, method, x, y, flowTabId, wireIds){
        var httpInNodeConfig = {
            "id": id,
            "type": "http in",
            "z": flowTabId,
            "name": "",
            "url": url,
            "method": method,
            "upload": false,
            "swaggerDoc": "",
            "x": x,
            "y": y,
            "wires": this.getWires(wireIds)
        };
    
        return httpInNodeConfig;
    }
    
    generateHttpResponseNode(id, statusCode, x, y, flowTabId){
        var responseNodeConfig = {
            "id": id,
            "type": "http response",
            "z": flowTabId,
            "name": "",
            "statusCode": statusCode,
            "headers": {},
            "x": x,
            "y": y,
            "wires": []
        };
    
        return responseNodeConfig;
    }


    
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }

    getWires(array){
        let result = [];

        for (let i = 0; i < array.length; i++){
            result.push([array[i]]);
        }

        return result;
    }
}

var tableData = {
    "name": "testtable",
    "properties" : [
        {"propertyName" : "testproperty1"},
        {"propertyName" : "testproperty2"}
    ]
}

var tableData1 = {
    "name": "dummy",
    "schema" : "public",
    "properties" : [
        {"propertyName" : "id"},
        {"propertyName" : "firstname"},
        {"propertyName" : "lastname"}
    ],
    "pk" : "id"
}

var tableData2 = {
    "name": "dummy",
    "schema" : "dbo",
    "properties" : [
        {"propertyName" : "id"},
        {"propertyName" : "firstname"},
        {"propertyName" : "lastname"}
    ],
    "pk" : "id"
}


var dbConfig = {
    "host" : "localhost",
    "port" : 5432,
    "database" : "postgres",
    "user" : "admin",
    "password" : "secret"
}



var dbConfig1 = {
    "host" : "localhost",
    "port" : 1433,
    "database" : "master",
    "user" : "sa",
    "password" : "strongPassword123!"
}


var generator = new TableRestApiGenerator();
//var restApi = generator.generateRestApiForTable(tableData1, dbConfig, "TestApi", "postgres");
var restApi = generator.generateRestApiForTable(tableData2, dbConfig1, "TestApi", "mssql");
console.log(JSON.stringify(restApi));
//console.log(generator.getWires(["a", "b"]));
