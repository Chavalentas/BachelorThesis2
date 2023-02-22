import { TableRestApiGenerator }  from "./table-rest-api-generator.js"
import { ViewRestApiGenerator } from "./view-rest-api-generator.js"

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

var tableData12 = {
    "name": "buildings",
    "schema" : "public",
    "properties" : [
        {"propertyName" : "buildingId"},
        {"propertyName" : "buildingName"},
    ],
    "pk" : "buildingId"
}

var viewData1 = {
    "name": "peoplenamedjohn",
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

var viewData2 = {
    "name": "peoplenamedjohn",
    "schema" : "dbo",
    "properties" : [
        {"propertyName" : "id"},
        {"propertyName" : "firstname"},
        {"propertyName" : "lastname"}
    ],
    "pk" : "id"
}

var tableData22 = {
    "name": "buildings",
    "schema" : "dbo",
    "properties" : [
        {"propertyName" : "buildingId"},
        {"propertyName" : "buildingName"},
    ],
    "pk" : "buildingId"
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
var restApi = generator.generate(tableData12, dbConfig, "TestApi", "postgres");
//var restApi = generator.generate(tableData22, dbConfig1, "TestApi", "mssql");
console.log(JSON.stringify(restApi));

/*
var generator = new ViewRestApiGenerator();
//var restApi = generator.generate(viewData1, dbConfig, "TestApi", "postgres");
var restApi = generator.generate(viewData2, dbConfig1, "TestApi", "mssql");
console.log(JSON.stringify(restApi));
*/