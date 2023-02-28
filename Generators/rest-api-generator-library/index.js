
const tableGen = require('./table-rest-api-generator.js');
const viewGen = require('./view-rest-api-generator.js');

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

var generator = new tableGen.TableRestApiGenerator();
var restApi = generator.generate(tableDataPostgres, dbConfigPostgres, "TestApi", "postgres");
//var restApi = generator.generate(tableDataMssql, dbConfigMssql, "TestApi", "mssql");
console.log(JSON.stringify(restApi));


/*
var generator = new viewGen.ViewRestApiGenerator();
//var restApi2 = generator.generate(viewDataPostgres, dbConfigPostgres, "TestApi", "postgres");
var restApi2 = generator.generate(viewDataMssql, dbConfigMssql, "TestApi", "mssql");
console.log(JSON.stringify(restApi2));
*/

/*
const tableGen = require('./table-rest-api-generator.js');
const viewGen = require('./view-rest-api-generator.js');
const procGen = require('./function-rest-api-generator.js');
const funcGen = require('./stored-procedure-rest-api-generator.js');

module.exports = {
   tableGen,
   viewGen,
   procGen,
   funcGen
}
*/