# Generated REST-APIs
This document contains the documentation of the generated REST-APIs.

## For tables and views
The section contains the documentation of REST-APIs for tables and views.

### GET 
**[url]/[schema].[objectName]**<br />
Retrieves the objects from the database object.<br />
Returns 200 response code with a JSON object with the following structure:
```javascript
{
    "result": [
        {
            [attrName1]: value,
            [attrName2]: value,
            ...
        },
        ...
    ]
}
```

**[url]/[schema].[objectName]?[attrName]=value&[attrName]=value...**<br />
Retrieves the objects from the database object using the query parameters.<br />
Returns 200 response code with a JSON object with the following structure:
```javascript
{
    "result": [
        {
            [attrName1]: value,
            [attrName2]: value,
            ...
        },
        ...
    ]
}
```
### POST
**[url]/[schema].[objectName]**<br />
Inserts an object to the database using the request body.<br />
The body has to have the following structure:<br />
```javascript
{
    [attrName1]: value,
    [attrName2]: value,
    ...
}
```
Returns 201 response code.

### PUT
**[url]/[schema].[objectName]/:[primaryKey]**<br />
Updates an object to the database using the request body and the primary key.<br />
The body has to have the following structure:<br />
```javascript
{
    [attrName1]: value,
    [attrName2]: value,
    ...
}
```
Returns 200 response code.

### DELETE
**[url]/[schema].[objectName]/:[primaryKey]**<br />
Deletes an object in the database using the primary key.<br />
Returns 200 response code.<br />
**[url]/[schema].[objectName]**
Deletes all objects in the database. <br />
Returns 200 reponse code.<br />
**[url]/[schema].[objectName]?[attrName]=value&[attrName]=value...**<br />
Deletes the objects from the database object using the query parameters.<br />
Returns 200 response code.

## For functions and stored procedures
The section contains the documentation of REST-APIs for functions and stored procedures.

### GET 
**[url]/[schema].[objectName]?param=value&param=value...**<br />
The order of the parameters has to correspond with the order of the parameters in the database object.<br />
The value **default** indicates that the default value of the parameter should be chosen.
Returns 200 response code with a JSON object with the following structure:
```javascript
{
    "result": [
        {
            [retName1]: value,
            [retName2]: value,
            ...
        },
        ...
    ]
}
```
Returns 200 response code with a JSON object with the following structure for stored procedures in Microsoft SQL server (multisets are allowed):
```javascript
{
    "result": [
      [
        {
            [retName1]: value,
            [retName2]: value,
            ...
        },
        ...
      ],
      ...
    ]
}
```