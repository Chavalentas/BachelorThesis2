import { TableRestApiGenerator }  from "./table-rest-api-generator.js"
import { ViewRestApiGenerator }  from "./view-rest-api-generator.js"

var tableData222 = {
    "name": "houses",
    "schema" : "public",
    "properties" : [
        {"propertyName" : "houseid"},
        {"propertyName" : "housename"},
    ],
    "pk" : "houseid"
}

var tableData2221 = {
    "name": "houses",
    "schema" : "dbo",
    "properties" : [
        {"propertyName" : "houseid"},
        {"propertyName" : "housename"},
    ],
    "pk" : "houseid"
}

var viewData222 = {
    "name": "housesview",
    "schema" : "public",
    "properties" : [
        {"propertyName" : "houseid"},
        {"propertyName" : "housename"},
    ],
    "pk" : "houseid"
}

var viewData2221 = {
    "name": "housesview",
    "schema" : "dbo",
    "properties" : [
        {"propertyName" : "houseid"},
        {"propertyName" : "housename"},
    ],
    "pk" : "houseid"
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
var restApi = generator.generate(tableData222, dbConfig, "TestApi", "postgres");
//var restApi = generator.generate(tableData2221, dbConfig1, "TestApi", "mssql");
console.log(JSON.stringify(restApi));



/*
var generator = new ViewRestApiGenerator();
//var restApi = generator.generate(viewData222, dbConfig, "TestApi", "postgres");
var restApi = generator.generate(viewData2221, dbConfig1, "TestApi", "mssql");
console.log(JSON.stringify(restApi));
*/