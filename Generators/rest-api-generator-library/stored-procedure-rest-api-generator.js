const routineGen = require('./routine-rest-api-generator.js');

const StoredProcedureRestApiGenerator = class extends routineGen.RoutineRestApiGenerator{
    constructor(){
        super();
        if (this.constructor == StoredProcedureRestApiGenerator) {
            throw new Error("The abstract stored procedure generator cannot be instantiated.");
        }
    }

    generate(objectData, databaseConfiguration, restApiName){
        if (this.helper.isNullOrUndefined(objectData)){
            throw new Error('The parameter objectData was null or undefined!');
        }

        if (this.helper.isNullOrUndefined(databaseConfiguration)){
            throw new Error('The parameter databaseConfiguration was null or undefined!');
        }

        if (this.helper.isNullOrUndefined(restApiName)){
            throw new Error('The parameter restApiName was null or undefined!');
        }

        throw new Error("generate(objectData, databaseConfiguration, restApiName) must be implemented!");
    }
}

module.exports = {
    StoredProcedureRestApiGenerator
}

