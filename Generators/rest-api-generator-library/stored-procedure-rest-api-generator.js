const routineGen = require('./routine-rest-api-generator.js');

const StoredProcedureRestApiGenerator = class extends routineGen.RoutineRestApiGenerator{
    constructor(){
        super();
        if (this.constructor == StoredProcedureRestApiGenerator) {
            throw new Error("The abstract stored procedure generator cannot be instantiated.");
        }
    }

    generate(entityData, databaseConfiguration, restApiName){
        throw new Error("generate(entityData, databaseConfiguration, restApiName) must be implemented!");
    }
}

module.exports = {
    StoredProcedureRestApiGenerator
}

