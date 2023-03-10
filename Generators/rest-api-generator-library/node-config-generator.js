const help = require('./helper-functions.js');

const NodeConfigGenerator = class {
    constructor(){
        this.helper = new help.Helper();
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

    generateMssqlNode(id, nodeName, x, y, flowTabId, statementCode, dbConfigId, wireIds, modeOpt, modeOptType, queryOpt, queryOptType, paramsOpt, paramsOptType, returnType){
        var msSqlNodeConfig = {
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
    
    generateDatabaseConfigNode(databaseConfiguration, id, provider){
        if (this.helper.isNullOrUndefined(provider)){
            throw new Error('The parameter provider was null or undefined!');
        }

        switch (provider){
            case 'postgres':
                return this.generatePostgresqlConfigurationNode(databaseConfiguration, id);
            case 'mssql':
                return this.generateMssqlConfigurationNode(databaseConfiguration, id);
            default:
                throw new Error("Unknown database provider identified!");
        }
    }

    getWires(array){
        if (this.helper.isNullOrUndefined(array)){
            throw new Error('The parameter array was null or undefined!');
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