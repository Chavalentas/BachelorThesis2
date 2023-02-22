# Documentation of the generator library

The document contains the documentation of the generator library.

## The generator of the REST-API for SQL tables 
Currenty two providers are supported: PostgreSQL and Microsoft SQL Server.
The generator can be instantiated like this:
```javascript
var generator = new TableRestApiGenerator();
```
The generator can be called like this:
```javascript
generator.generate(entityData, databaseConfiguration, restApiName, provider);
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
**NOTE**: The names of the properties has to correspond exactly to the names of the attributes.

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
The generator can be instantiated like this:
```javascript
var generator = new ViewRestApiGenerator();
```
The generator can be called like this:
```javascript
generator.generate(entityData, databaseConfiguration, restApiName, provider);
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
**NOTE**: The names of the properties has to correspond exactly to the names of the attributes.

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