const help = require('./helper-functions.js');

/**
 * Represents the node configuration generator.
 */
const NodeConfigGenerator = class{
    /**
     * Represents the constructor.
     */
    constructor(){
        this.helper = new help.Helper();
    }

    /**
     * Generates JSON configuration of the HTTP response node.
     * @param {*} id The ID of the node.
     * @param {*} statusCode The status code.
     * @param {*} x The x coordinate of the node.
     * @param {*} y The y coordinate of the node.
     * @param {*} flowTabId The ID of the flow.
     * @returns The JSON configuration of the node.
     */
    generateHttpResponseNode(id, statusCode, x, y, flowTabId){
        let responseNodeConfig = {
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

    /**
     * Generates JSON configuration of the HTTP in node.
     * @param {*} id The ID of the node.
     * @param {*} url The URL of the node.
     * @param {*} method The used HTTP method.
     * @param {*} x The x coordinate of the node.
     * @param {*} y The y coordinate of the node.
     * @param {*} flowTabId The ID of the flow.
     * @param {*} wireIds The IDs of the wires to the neighbouring nodes.
     * @returns The JSON configuration of the node.
     */
    generateHttpInNode(id, url, method, x, y, flowTabId, wireIds){
        let httpInNodeConfig = {
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
    
    /**
     * Generates JSON configuration of the catch error node.
     * @param {*} id The ID of the node.
     * @param {*} scope The scope of the node.
     * @param {*} x The x coordinate of the node.
     * @param {*} y The y coordinate of the node.
     * @param {*} flowTabId The ID of the flow.
     * @param {*} wireIds The IDs of the wires to the neighbouring nodes.
     * @returns The JSON configuration of the node.
     */
    generateCatchErrorNode(id, scope, x, y, flowTabId, wireIds){
        let catchErrorNode = {
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

    /**
     * Generates JSON configuration of the MSSQL node.
     * @param {*} id The ID of the node.
     * @param {*} nodeName The name of the node.
     * @param {*} x The x coordinate of the node.
     * @param {*} y The y coordinate of the node.
     * @param {*} flowTabId The ID of the flow.
     * @param {*} statementCode The SQL statement.
     * @param {*} dbConfigId The ID of the database configuration node.
     * @param {*} wireIds The IDs of the wires to the neighbouring nodes.
     * @param {*} modeOpt The mode option.
     * @param {*} modeOptType The mode option type.
     * @param {*} queryOpt The query option.
     * @param {*} queryOptType The query option type.
     * @param {*} paramsOpt The parameters option.
     * @param {*} paramsOptType The parameters option type.
     * @param {*} returnType The return type.
     * @returns The JSON configuration of the node.
     */
    generateMssqlNode(id, nodeName, x, y, flowTabId, statementCode, dbConfigId, wireIds, modeOpt, modeOptType, queryOpt, queryOptType, paramsOpt, paramsOptType, returnType){
        let msSqlNodeConfig = {
            "id": id,
            "type": "MSSQL",
            "z": flowTabId,
            "mssqlCN": dbConfigId,
            "name": nodeName,
            "outField": "payload",
            "returnType": returnType,
            "throwErrors": 1,
            "query": statementCode,
            "modeOpt": modeOpt, 
            "modeOptType": modeOptType, 
            "queryOpt": queryOpt,
            "queryOptType": queryOptType,
            "paramsOpt": paramsOpt, 
            "paramsOptType": paramsOptType, 
            "outputType" : "driver",
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

    /**
     * Generates JSON configuration of the PostgreSQL node.
     * @param {*} id The ID of the node.
     * @param {*} nodeName The name of the node. 
     * @param {*} x The x coordinate of the node. 
     * @param {*} y The y coordinate of the node. 
     * @param {*} flowTabId The ID of the flow.
     * @param {*} statementCode The SQL statement.
     * @param {*} dbConfigId The ID of the database configuration node.
     * @param {*} wireIds The IDs of the wires to the neighbouring nodes.
     * @returns The JSON configuration of the node.
     */
    generatePostgresqlNode(id, nodeName, x, y, flowTabId, statementCode, dbConfigId, wireIds){
        let postgresqlNodeConfig = {
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

    /**
     * Generates JSON configuration of the function node.
     * @param {*} id The ID of the node.
     * @param {*} functionName The name of the function.
     * @param {*} x The x coordinate of the node. 
     * @param {*} y The y coordinate of the node. 
     * @param {*} flowTabId The ID of the flow.
     * @param {*} functionCode The JavaScript code of the function node.
     * @param {*} wireIds The IDs of the wires to the neighbouring nodes.
     * @returns The JSON configuration of the node.
     */
    generateFunctionNode(id, functionName, x, y, flowTabId, functionCode, wireIds){
        let functionNodeConfig =  {
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

    /**
     * Generates JSON configuration of the flow tab.
     * @param {*} flowTabName The name of the flow tab.
     * @param {*} id The ID of the flow tab.
     * @returns The JSON configuration of the flow tab.
     */
    generateFlowTabNode(flowTabName, id){
        let tabConfig = {
            "id": id,
            "type": "tab",
            "label": flowTabName,
            "disabled": false,
            "info": "",
            "env": []
        };
    
        return tabConfig;
    }

    /**
     * Generates JSON configuration of the PostgreSQL configuration node.
     * @param {*} databaseConfiguration  Contains the information that is necessary for the establishment of database connection.
     * @param {*} id The ID of the node.
     * @returns The JSON configuration of the node.
     */
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
    
    /**
     * Generates JSON configuration of the MSSQL configuration node.
     * @param {*} databaseConfiguration  Contains the information that is necessary for the establishment of database connection.
     * @param {*} id The ID of the node.
     * @returns The JSON configuration of the node.
     */
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

    /**
     * Generates JSON configuration of the comment node.
     * @param {*} id The ID of the node.
     * @param {*} commentName The comment name.
     * @param {*} x The x coordinate of the node. 
     * @param {*} y The y coordinate of the node. 
     * @param {*} flowTabId The ID of the flow.
     * @param {*} wireIds The IDs of the wires to the neighbouring nodes.
     * @returns The JSON configuration of the node.
     */
    generateCommentNode(id, commentName, x, y, flowTabId, wireIds){
        let commentNode =  {
            "id": id,
            "type": "comment",
            "z": flowTabId,
            "name": commentName,
            "info": "",
            "x": x,
            "y": y,
            "wires": this.getWires(wireIds)
        };

        return commentNode;
    }

    /**
     * Generates JSON configuration of the switch node.
     * @param {*} id The ID of the node.
     * @param {*} switchName 
     * @param {*} x The x coordinate of the node. 
     * @param {*} y The y coordinate of the node. 
     * @param {*} flowTabId The ID of the flow.
     * @param {*} wireIds The IDs of the wires to the neighbouring nodes.
     * @param {*} outputs The outputs.
     * @param {*} property The switch property.
     * @param {*} propertyType The switch property type.
     * @param {*} rules The switch rules.
     * @returns The JSON configuration of the node.
     */
    generateSwitchNode(id, switchName, x, y, flowTabId, wireIds, outputs, property, propertyType, rules){
        let switchNode =  {
            "id": id,
            "type": "switch",
            "z": flowTabId,
            "name": switchName,
            "property": property,
            "propertyType": propertyType,
            "rules": rules,
            "checkall": "true",
            "repair": false,
            "outputs": outputs,
            "x": x,
            "y": y,
            "wires": this.getWires(wireIds)
        };

        return switchNode;
    }
    
    /**
     * Generates JSON configuration of the database configuration based on the provider.
     * @param {*} databaseConfiguration Contains the information that is necessary for the establishment of database connection.
     * @param {*} id The ID of the node.
     * @param {*} provider Contains the database provider (postgres or mssql).
     * @returns The JSON configuration of the node.
     */
    generateDatabaseConfigNode(databaseConfiguration, id, provider){
        if (this.helper.isNullOrUndefined(provider)){
            throw new Error("The parameter provider was null or undefined!");
        }

        switch (provider){
            case "postgres":
                return this.generatePostgresqlConfigurationNode(databaseConfiguration, id);
            case "mssql":
                return this.generateMssqlConfigurationNode(databaseConfiguration, id);
            default:
                throw new Error("Unknown database provider identified!");
        }
    }

    /**
     * Gets the wires based on the parameters.
     * @param {*} array Gets wires from the array of IDs.
     * @returns Array of wires.
     */
    getWires(array){
        if (this.helper.isNullOrUndefined(array)){
            throw new Error("The parameter array was null or undefined!");
        }

        let result = [];

        for (let i = 0; i < array.length; i++){
            result.push([array[i]]);
        }

        return result;
    }
}

module.exports = {
    NodeConfigGenerator
}