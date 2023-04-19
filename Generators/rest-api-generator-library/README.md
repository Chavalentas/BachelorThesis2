# Documentation of the generator library

The document contains the documentation of the generator library.

## Usage as package
The module exports the following function: **generate**.

```javascript
module.exports = {
    generate: generate
};
```
E.g., if you want to use the REST-API generator for SQL tables, use: 
```javascript
var config = generate(objectData, dbObjectType, databaseConfiguration, restApiName, provider);
```

## The generator of the REST-API for SQL tables 
Currenty two providers are supported: PostgreSQL and Microsoft SQL Server.
The generator can be called like this:
```javascript
generate(objectData, dbObjectType, databaseConfiguration, restApiName, provider);
```
**objectData**: contains the data relevant for the parsing of the database object, 
use the following structure for the table
```javascript
var objectData = {
    "name": "objectname",
    "schema": "schemaofobject",
    "properties": [
        {"propertyName": "name1"},
        {"propertyName": "name2"},
        ...
    ],
    "pk": "name1"
}
```
The property **pk** denotes the name of the primary key (has to be the name of one of the properties).
Currently, only one primary key is supported (so passing an array of more primary keys won't work).
**NOTE**: The names of the properties has to correspond exactly to the names of the attributes.

**dbObjectType**: "table", "view", "function" or "strp" (for stored procedure)

**databaseConfiguration**: contains the data needed to connect to the database, 
use the following structure
```javascript
var databaseConfiguration = {
    "host": "host",
    "port": 1111,
    "database": "db",
    "user": "user",
    "password": "pw"
}
```
**restApiName**: name of the REST-API

**provider**: used provider ("postgres" or "mssql")

## The generator of the REST-API for SQL views
Currenty two providers are supported: PostgreSQL and Microsoft SQL Server.
The generator can be called like this:
```javascript
generate(objectData, dbObjectType, databaseConfiguration, restApiName, provider);
```
**objectData**: contains the data relevant for the parsing of the database object, 
use the following structure for the view
```javascript
var objectData = {
    "name": "objectname",
    "schema": "schemaofobject",
    "properties": [
        {"propertyName": "name1"},
        {"propertyName": "name2"},
        ...
    ],
    "pk": "name1"
}
```
The property **pk** denotes the name of the primary key (has to be the name of one of the properties).
Currently, only one primary key is supported (so passing an array of more primary keys won't work).
**NOTE**: The names of the properties has to correspond exactly to the names of the attributes.

**dbObjectType**: "table", "view", "function" or "strp" (for stored procedure)

**databaseConfiguration**: contains the data needed to connect to the database, 
use the following structure
```javascript
var databaseConfiguration = {
    "host": "host",
    "port": 1111,
    "database": "db",
    "user": "user",
    "password": "pw"
}
```
**restApiName**: name of the REST-API

**provider**: used provider ("postgres" or "mssql")

## The generator of the REST-API for SQL functions
Currenty two providers are supported: PostgreSQL and Microsoft SQL Server.
The generator can be called like this:
```javascript
generate(objectData, dbObjectType, databaseConfiguration, restApiName, provider);
```
**objectData**: contains the data relevant for the parsing of the database object, 
use the following structure for the function
```javascript
var objectData = {
    "name": "functionname",
    "schema": "functionschema"
}
```

**dbObjectType**: "table", "view", "function" or "strp" (for stored procedure)

**databaseConfiguration**: contains the data needed to connect to the database, 
use the following structure
```javascript
var databaseConfiguration = {
    "host": "host",
    "port": 1111,
    "database": "db",
    "user": "user",
    "password": "pw"
}
```
**restApiName**: name of the REST-API

**provider**: used provider ("postgres" or "mssql")

## The generator of the REST-API for SQL stored procedures
Currenty two providers are supported: PostgreSQL and Microsoft SQL Server.
The generator can be called like this:
```javascript
generate(objectData, dbObjectType, databaseConfiguration, restApiName, provider);
```
**objectData**: contains the data relevant for the parsing of the database object,
use the following structure for the stored procedure
```javascript
var objectData = {
    "name": "procedurename",
    "schema": "procedureschema"
}
```

**dbObjectType**: "table", "view", "function" or "strp" (for stored procedure)

**databaseConfiguration**: contains the data needed to connect to the database, 
use the following structure
```javascript
var databaseConfiguration = {
    "host": "host",
    "port": 1111,
    "database": "db",
    "user": "user",
    "password": "pw"
}
```
**restApiName**: name of the REST-API

**provider**: used provider ("postgres" or "mssql")