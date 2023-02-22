import { TableRestApiGenerator }  from "./table-rest-api-generator.js"

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
var restApi = generator.generate(tableData1, dbConfig, "TestApi", "postgres");
//var restApi = generator.generateRestApiForTable(tableData2, dbConfig1, "TestApi", "mssql");
console.log(JSON.stringify(restApi));
//console.log(generator.getWires(["a", "b"]));
