const gen = require('./generator.js');

/**
 * Represents the REST-API generator for relations.
 */
const RelationRestApiGenerator = class extends gen.Generator{
    /**
     * Represents the constructor.
     */
    constructor(){
        super();
        if (this.constructor == RelationRestApiGenerator){
            throw new Error("The abstract relation generator cannot be instantiated.");
        }
    }

    /**
     * Generates the REST-API for a SQL relation based on the following parameters.
     * @param {*} objectData Contains the meta information about the database object.
     * @param {*} databaseConfiguration Contains the information that is necessary for the establishment of database connection.
     * @param {*} restApiName Contains the name of the REST-API.
     * @returns The JSON configuration of the generated flow.
     */
    generate(objectData, databaseConfiguration, restApiName){
        if (this.helper.isNullOrUndefined(objectData)){
            throw new Error("The parameter objectData was null or undefined!");
        }

        if (this.helper.isNullOrUndefined(databaseConfiguration)){
            throw new Error("The parameter databaseConfiguration was null or undefined!");
        }

        if (this.helper.isNullOrUndefined(restApiName)){
            throw new Error("The parameter restApiName was null or undefined!");
        }

        throw new Error("generate(objectData, databaseConfiguration, restApiName) must be implemented!");
    }

    /**
     * Generates the query properties.
     * @param {*} objectData Contains the meta information about the database object.
     * @param {*} prefix The prefix of the properties.
     * @returns The JavaScript code of query properties.
     */
    generateQueryProperties(objectData, prefix){
        if (this.helper.isNullOrUndefined(objectData)){
            throw new Error("The parameter objectData was null or undefined!");
        }

        if (this.helper.isNullOrUndefined(prefix)){
            throw new Error("The parameter prefix was null or undefined!");
        }

        var ifCodes = [];
        for (let i = 0; i < objectData.properties.length; i++){
            var ifCode = `if (${prefix}.${objectData.properties[i].propertyName} !== undefined){\n    msg.queryProperties.push({\"propertyName\": \"${objectData.properties[i].propertyName}\", \"propertyValue\": \`\${${prefix}.${objectData.properties[i].propertyName}}\`});\n}`;
            ifCodes.push(ifCode);
        }

        var propertiesInString = objectData.properties.map(p => `\"${p.propertyName}\"`);
        var code = `msg.queryProperties = [];\nvar properties = [${propertiesInString.join(",")}];\nvar queryProperties = Object.getOwnPropertyNames(msg.req.query);\n\nif (queryProperties.some(p => !properties.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query property detected!\");\n}\n\nif (queryProperties.some(p => !properties.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query property detected!\");\n}\n\n${ifCodes.join("\n\n")}\n\nreturn msg;`;
        return code;
    }

    /**
     * Generates the request body pushes.
     * @param {*} properties The properties to push.
     * @returns The JavaScript code of request body pushes.
     */
    generateRequestBodyPushes(properties){
        if (this.helper.isNullOrUndefined(properties)){
            throw new Error("The parameter properties was null or undefined!");
        }
        
        var ifCodes = [];
        for (let i = 0; i < properties.length; i++){
            var ifCode = `if (msg.req.body.${properties[i].propertyName} !== undefined){\n    msg.queryProperties.push({ \"propertyName\": \"${properties[i].propertyName}\", \"propertyValue\": \`\${msg.req.body.${properties[i].propertyName}}\` })\n}`;
            ifCodes.push(ifCode);
        }

        var result = ifCodes.join("\n\n");
        return result;
    }
}

module.exports = {
    RelationRestApiGenerator
}