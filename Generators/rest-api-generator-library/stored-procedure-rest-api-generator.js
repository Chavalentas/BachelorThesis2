const routineGen = require('./routine-rest-api-generator.js');

/**
 * Represents the REST-API generator for stored procedures.
 */
const StoredProcedureRestApiGenerator = class extends routineGen.RoutineRestApiGenerator{
    /**
     * Represents the constructor.
     */
    constructor(){
        super();
        if (this.constructor == StoredProcedureRestApiGenerator){
            throw new Error("The abstract stored procedure generator cannot be instantiated.");
        }
    }

    /**
     * Generates the REST-API for a SQL stored procedure based on the following parameters.
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
}

module.exports = {
    StoredProcedureRestApiGenerator
}

