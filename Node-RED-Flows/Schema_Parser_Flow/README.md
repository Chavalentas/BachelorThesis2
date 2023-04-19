# Documentation of the flow
This document contains the documentation of the flow.
## [post]/get-schemas (POST request)
Gets database schemas based on connection data.
The body has the following structure:
```javascript
{
    "conn": "Host=localhost;Port=5432;User=admin;Pw=secret;Db=postgres;Provider=[mssql | postgres]"
}
```
**conn**: the connection string has always this form -> "Host=hostname;Port=port;User=user;Pw=password;Db=database;Provider=dbprovider"
### The response type
```javascript
{
   "result": [{"schemaName" : "name"},...]
}
```

## [post]/get-db-provider (POST request)
Gets the database provider based on connection data.
The body has the following structure:
```javascript
{
    "conn": "Host=localhost;Port=5432;User=admin;Pw=secret;Db=postgres"
}
```
**conn**: the connection string has always this form -> "Host=hostname;Port=port;User=user;Pw=password;Db=database"
### The response type
```javascript
{
   "result": ["nameofthedbprovider"]
}
```

## [post]/get-schema_enums (POST request)
Gets a list of entities stored in a database schema.
The body has the following structure:
```javascript
{
    "conn": "Host=localhost;Port=1433;User=sa;Pw=strongPassword123!;Db=master;Provider=[mssql | postgres]",
    "schema": "dbo",
    "dbObjectType": "view"
}
```
**conn**: the connection string has always this form -> "Host=hostname;Port=port;User=user;Pw=password;Db=database;Provider=dbprovider"<br />
**schema**: the schema of the database object<br />
**dbObjectType**: "table", "view", "function" or "strp"

### The response type
```javascript
{
   "result": [{"dbObjectName" : "name"},...]
}
```

## [post]/get-db-object-information (POST request)
Gets the information about the database object based on the connection information and object name.
The body has the following structure:
```javascript
{
    "conn": "Host=localhost;Port=5432;User=admin;Pw=secret;Db=postgres;Provider=[mssql | postgres]",
    "schema": "public",
    "dbObjectType": "strp",
    "dbObjectName": "count_procedure3"
}
```
**conn**: the connection string has always this form -> "Host=hostname;Port=port;User=user;Pw=password;Db=database;Provider=dbprovider"<br />
**schema**: the schema of the database object<br />
**dbObjectType**: "table", "view", "function" or "strp"<br />
**dbObjectName**: name of the database object

### The response type
For tables and views:
```javascript
{
    "result": [
        {
            "name": "houses",
            "schema": "public",
            "properties": [
                {
                    "propertyName": "houseid"
                },
                {
                    "propertyName": "housename"
                }
            ],
            "pk": [
                "houseid"
            ]
        }
    ]
}
```
For functions and stored procedures:
```javascript
{
    "result": [
        {
            "name": "tvf_test",
            "schema": "public"
        }
    ]
}
```