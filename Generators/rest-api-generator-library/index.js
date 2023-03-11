/*
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
    "schema" : "dbo"
}

var tabledFunctionDataMssql2 = {
    "name" : "tvf_houses"
}

var tabledFunctionDataPostgres = {
    "name" : "tvf_test",
    "schema" : "public"
}

var storedProcedureDataMssql = {
    "name" : "pr_test",
    "schema" : "dbo"
}

var storedProcedureDataPostgres = {
    "name" : "count_procedure3",
    "schema" : "public"
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

var dbConfigMssql2 = {
    "host" : "localhost",
    "port" : 79,
    "database" : "master",
    "user" : "sa",
    "password" : "strongPassword123!"
}
*/
// Test cases: uncomment parts above and below
/*
//var restApi = generate(tableDataPostgres, "table", dbConfigPostgres, "TestApi", "postgres");
var restApi = generate(tableDataMssql, "table", dbConfigMssql2, "TestApi", "mssql");
console.log(JSON.stringify(restApi));
*/


/*
//var restApi = generate(viewDataPostgres, "view", dbConfigPostgres, "TestApi", "postgres");
var restApi = generate(viewDataMssql, "view", dbConfigMssql2, "TestApi", "mssql");
console.log(JSON.stringify(restApi));
*/


/*
//var restApi = generate(tabledFunctionDataPostgres, "function", dbConfigPostgres, "TestFunction", "postgres");
var restApi = generate(tabledFunctionDataMssql, "function", dbConfigMssql2, "TestFunction", "mssql");
console.log(JSON.stringify(restApi));
*/


/*
//var restApi = generate(storedProcedureDataPostgres, "strp", dbConfigPostgres, "TestProc", "postgres");
var restApi = generate(storedProcedureDataMssql, "strp", dbConfigMssql2, "TestProc", "mssql");
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
const helperLib = require('./helper-functions.js');

function generate(objectData, dbObjectType, databaseConfiguration, restApiName, provider) {
    const helper = new helperLib.Helper();

    if (helper.isNullOrUndefined(objectData)){
        throw new Error('The parameter objectData was null or undefined!');
    }

    if (helper.isNullOrUndefined(dbObjectType)){
        throw new Error('The parameter dbObjectType was null or undefined!');
    }

    if (helper.isNullOrUndefined(databaseConfiguration)){
        throw new Error('The parameter databaseConfiguration was null or undefined!');
    }

    if (helper.isNullOrUndefined(restApiName)){
        throw new Error('The parameter restApiName was null or undefined!');
    }

    if (helper.isNullOrUndefined(provider)){
        throw new Error('The parameter provider was null or undefined!');
    }

    switch(provider){
        case 'postgres':
            return generateForPostgres(objectData, databaseConfiguration, dbObjectType, restApiName);
        case 'mssql':
            return generateForMssql(objectData, databaseConfiguration, dbObjectType, restApiName);
        default:
            throw new Error(`The provider ${provider} is not supported!`);
    }
}

function generateForPostgres(objectData, databaseConfiguration, dbObjectType, restApiName){
    const helper = new helperLib.Helper();

    if (helper.isNullOrUndefined(objectData)){
        throw new Error('The parameter objectData was null or undefined!');
    }

    if (helper.isNullOrUndefined(databaseConfiguration)){
        throw new Error('The parameter databaseConfiguration was null or undefined!');
    }

    if (helper.isNullOrUndefined(dbObjectType)){
        throw new Error('The parameter dbObjectType was null or undefined!');
    }

    if (helper.isNullOrUndefined(restApiName)){
        throw new Error('The parameter restApiName was null or undefined!');
    }

    switch (dbObjectType){
        case 'table':
            return new postgresTableGen.PostgresTableRestApiGenerator().generate(objectData, databaseConfiguration, restApiName);
        case 'view':
            return new postgresViewGen.PostgresViewRestApiGenerator().generate(objectData, databaseConfiguration, restApiName);
        case 'function':
            return new postgresFuncGen.PostgresFunctionRestApiGenerator().generate(objectData, databaseConfiguration, restApiName);
        case 'strp':
            return new postgresProcGen.PostgresStoredProcedureRestApiGenerator().generate(objectData, databaseConfiguration, restApiName);
        default:
            throw new Error('Unsupported database object type detected!');
    }
}

function generateForMssql(objectData, databaseConfiguration, dbObjectType, restApiName){
    const helper = new helperLib.Helper();

    if (helper.isNullOrUndefined(objectData)){
        throw new Error('The parameter objectData was null or undefined!');
    }

    if (helper.isNullOrUndefined(databaseConfiguration)){
        throw new Error('The parameter databaseConfiguration was null or undefined!');
    }

    if (helper.isNullOrUndefined(dbObjectType)){
        throw new Error('The parameter dbObjectType was null or undefined!');
    }

    if (helper.isNullOrUndefined(restApiName)){
        throw new Error('The parameter restApiName was null or undefined!');
    }

    switch (dbObjectType){
        case 'table':
            return new mssqlTableGen.MssqlTableRestApiGenerator().generate(objectData, databaseConfiguration, restApiName);
        case 'view':
            return new mssqlViewGen.MssqlViewRestApiGenerator().generate(objectData, databaseConfiguration, restApiName);
        case 'function':
            return new mssqlFuncGen.MssqlFunctionRestApiGenerator().generate(objectData, databaseConfiguration, restApiName);
        case 'strp':
            return new mssqlProcGen.MssqlStoredProcedureRestApiGenerator().generate(objectData, databaseConfiguration, restApiName);
        default:
            throw new Error('Unsupported database object type detected!');
    }
}

module.exports = {
    generate : generate
};