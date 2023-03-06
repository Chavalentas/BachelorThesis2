# Documentation of the generator library

The document contains the documentation of the generator library.

## Usage as package
The module exports the following function: **generate**.

```javascript
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
**entityData** : contains the data relevant for the parsing of the entity, 
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

**databaseConfiguration** : contains the data needed to connect to the database, 
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
**entityData** : contains the data relevant for the parsing of the entity, 
use the following structure for the view
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

**databaseConfiguration** : contains the data needed to connect to the database, 
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

## The generator of the REST-API for SQL functions
Currenty two providers are supported: PostgreSQL and Microsoft SQL Server.
The generator can be called like this:
```javascript
generate(entityData, entityType, databaseConfiguration, restApiName, provider);
```
**entityData** : contains the data relevant for the parsing of the entity, 
use the following structure for the function
```javascript
var entityData = {
    "name" : "functionname",
    "schema" : "functionschema",
    "parameters" : [
        {"parameterName" : "param1"},
        {"parameterName" : "param2"},
        {"parameterName" : "param3"},
         ...
    ]
}
```

**NOTE**: The names of the parameters have to correspond exactly to the names of the function parameters.
The sequence of parameters must correspond to the order of the parameters of the function.


**entityType** : table, view, function or strp (for stored procedure)

**databaseConfiguration** : contains the data needed to connect to the database, 
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

## The generator of the REST-API for SQL stored procedures
Currenty two providers are supported: PostgreSQL and Microsoft SQL Server.
The generator can be called like this:
```javascript
generate(entityData, entityType, databaseConfiguration, restApiName, provider);
```
**entityData** : contains the data relevant for the parsing of the entity, 
use the following structure for the stored procedure
```javascript
var entityData = {
    "name" : "procedurename",
    "schema" : "procedureschema",
    "parameters" : [
        {"parameterName" : "param1"},
        {"parameterName" : "param2"},
        {"parameterName" : "param3"},
         ...
    ]
}
```

**NOTE**: The names of the parameters have to correspond exactly to the names of the stored procedure parameters.
The sequence of parameters must correspond to the order of the parameters of the stored procedure.


**entityType** : table, view, function or strp (for stored procedure)

**databaseConfiguration** : contains the data needed to connect to the database, 
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