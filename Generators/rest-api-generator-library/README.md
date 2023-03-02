# Documentation of the generator library

The document contains the documentation of the generator library.

## Usage as package
The module exports the following function: **generate**.

```javascript
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
```
E.g., if you want to use the REST-API generator for SQL tables, use: 
```javascript
var generator = generate(entityData, entityType, databaseConfiguration, restApiName, provider);
```

## The generator of the REST-API for SQL tables 
Currenty two providers are supported: PostgreSQL and Microsoft SQL Server.
The generator can be called like this:
```javascript
generate(entityData, entityType, databaseConfiguration, restApiName, provider);
```
**entityData** : contains the data relevant for the parsing of the entity
use the following structure for the table
```javascript
var entityData = {
    "name": "entityname",
    "schema" : "schemaofentity",
    "properties" : [
        {"propertyName" : "name1"},
        {"propertyName" : "name2"},
        ...
    ],
    "pk" : "name1"
}
```
The property **pk** denotes the name of the primary key (has to be the name of one of the properties).
Currently, only one primary key is supported (so passing an array of more primary keys won't work).
**NOTE**: The names of the properties has to correspond exactly to the names of the attributes.

**entityType** : table, view, function or strp (for stored procedure)

**databaseConfiguration** : contains the data needed to connect to the database
use the following structure
```javascript
var databaseConfiguration = {
    "host" : "host",
    "port" : 1111,
    "database" : "db",
    "user" : "user",
    "password" : "pw"
}
```
**restApiName** : name of the REST-API

**provider**: used provider (postgres or mssql)

## The generator of the REST-API for SQL views
Currenty two providers are supported: PostgreSQL and Microsoft SQL Server.
The generator can be called like this:
```javascript
generate(entityData, entityType, databaseConfiguration, restApiName, provider);
```
**entityData** : contains the data relevant for the parsing of the entity
use the following structure for the table
```javascript
var entityData = {
    "name": "entityname",
    "schema" : "schemaofentity",
    "properties" : [
        {"propertyName" : "name1"},
        {"propertyName" : "name2"},
        ...
    ],
    "pk" : "name1"
}
```
The property **pk** denotes the name of the primary key (has to be the name of one of the properties).
Currently, only one primary key is supported (so passing an array of more primary keys won't work).
**NOTE**: The names of the properties has to correspond exactly to the names of the attributes.

**entityType** : table, view, function or strp (for stored procedure)

**databaseConfiguration** : contains the data needed to connect to the database
use the following structure
```javascript
var databaseConfiguration = {
    "host" : "host",
    "port" : 1111,
    "database" : "db",
    "user" : "user",
    "password" : "pw"
}
```
**restApiName** : name of the REST-API

**provider**: used provider (postgres or mssql)