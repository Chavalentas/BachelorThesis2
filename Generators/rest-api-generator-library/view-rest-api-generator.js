const relGen = require('./relation-rest-api-generator.js');

/**
 * Represents the REST-API generator for views.
 */
const ViewRestApiGenerator = class extends relGen.RelationRestApiGenerator{
    /**
     * Represents the constructor.
     */
    constructor(){
        super();
        if (this.constructor == ViewRestApiGenerator){
            throw new Error("The abstract view generator cannot be instantiated.");
        }
    }

    /**
     * Generates the REST-API for a SQL view based on the following parameters.
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

        return super.generateQueryProperties(objectData, prefix);
    }

    /**
     * Generates the request body pushes.
     * @param {*} properties The properties to push.
     * @returns The JavaScript code of request body pushes.
     */
    generateRequestBodyChecks(properties){
        if (this.helper.isNullOrUndefined(properties)){
            throw new Error("The parameter properties was null or undefined!");
        }
        
        return super.generateRequestBodyChecks(properties);
    }
}

module.exports = {
    ViewRestApiGenerator
}