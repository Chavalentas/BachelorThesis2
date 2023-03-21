# Documentation of the flow
This document contains the documentation of the flow.
## The endpoint
**[post-url]/get-rest-config (POST request)**
The body has the following structure:
### For views and tables
```javascript
{
    "conn" : "Host=localhost;Port=1433;User=sa;Pw=strongPassword123!;Db=master",
    "dbObjectType" : "table",
    "provider" : "mssql",
    "apiName" : "TestApi",
    "dbObjectInformation" : {
        "name" : "housesview",
        "schema" : "dbo",
        "properties" : [
              {"propertyName" : "houseid"},
              {"propertyName" : "housename"}
        ],
        "pk" : ["houseid"]
    }
}
```
**conn**: the connection string has always this form -> "Host=hostname;Port=port;User=user;Pw=password;Db=database"
**dbObjectType**: table or view
**provider**: postgres or mssql
**apiName**: the name of the REST-API
**dbObjectInformation.name**: name of the table/view
**dbObjectInformation.schema**: the schema of the database object
**dbObjectInformation.properties**: the properties have always this form -> [{"propertyName": "name"},...]
**pk**: the primary keys (currently only one supported)

### For functions and stored procedures
```javascript
{
    "conn" : "Host=localhost;Port=5432;User=admin;Pw=secret;Db=postgres",
    "dbObjectType" : "strp",
    "provider" : "postgres",
    "apiName" : "TestApi",
    "dbObjectInformation" : {
        "name" : "count_procedure3",
        "schema" : "public"
     }
}
```
**conn**: the connection string has always this form -> "Host=hostname;Port=port;User=user;Pw=password;Db=database"
**dbObjectType**: function or strp
**provider**: postgres or mssql
**apiName**: the name of the REST-API
**dbObjectInformation.name**: name of the function/stored procedure
**dbObjectInformation.schema**: the schema of the database object

## The response type
The JSON configuration of the flow (can be directly imported into Node-RED).