
var tableDataPostgres = {
    "name": "houses",
    "schema" : "public",
    "properties" : [
        {"propertyName" : "houseid"},
        {"propertyName" : "housename"},
    ],
    "pk" : "houseid"
}

var tableDataMssql = {
    "name": "houses",
    "schema" : "dbo",
    "properties" : [
        {"propertyName" : "houseid"},
        {"propertyName" : "housename"},
    ],
    "pk" : "houseid"
}

var tabledFunctionDataMssql = {
    "name" : "tvf_test",
    "schema" : "dbo",
    "parameters" : [
        {"parameterName" : "@p1"},
        {"parameterName" : "@p2"},
        {"parameterName" : "@p3"}
    ]
}

var tabledFunctionDataMssql2 = {
    "name" : "tvf_houses",
    "schema" : "dbo",
    "parameters" : [
    ]
}

var tabledFunctionDataPostgres = {
    "name" : "tvf_test",
    "schema" : "public",
    "parameters" : [
        {"parameterName" : "p1"},
        {"parameterName" : "p2"},
        {"parameterName" : "p3"}
    ]
}

var storedProcedureDataMssql = {
    "name" : "pr_test",
    "schema" : "dbo",
    "parameters" : [
        {"parameterName" : "@p1"},
        {"parameterName" : "@p2"},
        {"parameterName" : "@p3"}
    ]
}

var storedProcedureDataPostgres = {
    "name" : "count_procedure3",
    "schema" : "public",
    "parameters" : [
        {"parameterName" : "param"},
        {"parameterName" : "param2"}
    ]
}

var viewDataPostgres = {
    "name": "housesview",
    "schema" : "public",
    "properties" : [
        {"propertyName" : "houseid"},
        {"propertyName" : "housename"},
    ],
    "pk" : "houseid"
}

var viewDataMssql = {
    "name": "housesview",
    "schema" : "dbo",
    "properties" : [
        {"propertyName" : "houseid"},
        {"propertyName" : "housename"},
    ],
    "pk" : "houseid"
}


var dbConfigPostgres = {
    "host" : "localhost",
    "port" : 5432,
    "database" : "postgres",
    "user" : "admin",
    "password" : "secret"
}



var dbConfigMssql = {
    "host" : "localhost",
    "port" : 1433,
    "database" : "master",
    "user" : "sa",
    "password" : "strongPassword123!"
}

/*
//var restApi = generate(tableDataPostgres, "table", dbConfigPostgres, "TestApi", "postgres");
var restApi = generate(tableDataMssql, "table", dbConfigMssql, "TestApi", "mssql");
console.log(JSON.stringify(restApi));
*/


/*
//var restApi = generate(viewDataPostgres, "view", dbConfigPostgres, "TestApi", "postgres");
var restApi = generate(viewDataMssql, "view", dbConfigMssql, "TestApi", "mssql");
console.log(JSON.stringify(restApi));
*/


/*
//var restApi = generate(tabledFunctionDataPostgres, "function", dbConfigPostgres, "TestFunction", "postgres");
var restApi = generate(tabledFunctionDataMssql, "function", dbConfigMssql, "TestFunction", "mssql");
console.log(JSON.stringify(restApi));
*/


/*
//var restApi = generate(storedProcedureDataPostgres, "strp", dbConfigPostgres, "TestProc", "postgres");
var restApi = generate(storedProcedureDataMssql, "strp", dbConfigMssql, "TestProc", "mssql");
console.log(JSON.stringify(restApi));
*/

const postgresTableGen = require('./postgres-table-rest-api-generator.js');
const mssqlTableGen = require('./mssql-table-rest-api-generator.js');
const postgresViewGen = require('./postgres-view-rest-api-generator.js');
const mssqlViewGen = require('./mssql-view-rest-api-generator.js');
const postgresFuncGen = require('./postgres-function-rest-api-generator.js');
const mssqlFuncGen = require('./mssql-function-rest-api-generator.js');
const postgresProcGen = require('./postgres-stored-procedure-rest-api-generator.js');
const mssqlProcGen = require('./mssql-stored-procedure-rest-api-generator.js');

function generate(entityData, entityType, databaseConfiguration, restApiName, provider) {
    switch(provider){
        case 'postgres':
            return generateForPostgres(entityData, databaseConfiguration, entityType, restApiName);
        case 'mssql':
            return generateForMssql(entityData, databaseConfiguration, entityType, restApiName);
        default:
            throw new Error(`The provider ${provider} is not supported!`);
    }
}

function generateForPostgres(entityData, databaseConfiguration, entityType, restApiName){
    switch (entityType){
        case 'table':
            return new postgresTableGen.PostgresTableRestApiGenerator().generate(entityData, databaseConfiguration, restApiName);
        case 'view':
            return new postgresViewGen.PostgresViewRestApiGenerator().generate(entityData, databaseConfiguration, restApiName);
        case 'function':
            return new postgresFuncGen.PostgresFunctionRestApiGenerator().generate(entityData, databaseConfiguration, restApiName);
        case 'strp':
            return new postgresProcGen.PostgresStoredProcedureRestApiGenerator().generate(entityData, databaseConfiguration, restApiName);
        default:
            throw new Error('Unsupported entity type detected!');
    }
}

function generateForMssql(entityData, databaseConfiguration, entityType, restApiName){
    switch (entityType){
        case 'table':
            return new mssqlTableGen.MssqlTableRestApiGenerator().generate(entityData, databaseConfiguration, restApiName);
        case 'view':
            return new mssqlViewGen.MssqlViewRestApiGenerator().generate(entityData, databaseConfiguration, restApiName);
        case 'function':
            return new mssqlFuncGen.MssqlFunctionRestApiGenerator().generate(entityData, databaseConfiguration, restApiName);
        case 'strp':
            return new mssqlProcGen.MssqlStoredProcedureRestApiGenerator().generate(entityData, databaseConfiguration, restApiName);
        default:
            throw new Error('Unsupported entity type detected!');
    }
}

module.exports = {
    generate : generate
};