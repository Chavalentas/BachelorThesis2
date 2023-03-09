const routineGen = require('./routine-rest-api-generator.js');

const FunctionRestApiGenerator = class extends routineGen.RoutineRestApiGenerator{
    constructor(){
        super();
        if (this.constructor == FunctionRestApiGenerator) {
            throw new Error("The abstract function generator cannot be instantiated.");
        }
    }

    generate(entityData, databaseConfiguration, restApiName){
        if (this.helper.isNullOrUndefined(entityData)){
            throw new Error('The parameter entityData was null or undefined!');
        }

        if (this.helper.isNullOrUndefined(databaseConfiguration)){
            throw new Error('The parameter databaseConfiguration was null or undefined!');
        }

        if (this.helper.isNullOrUndefined(restApiName)){
            throw new Error('The parameter restApiName was null or undefined!');
        }

        throw new Error("generate(entityData, databaseConfiguration, restApiName) must be implemented!");
    }
}

module.exports = {
    FunctionRestApiGenerator
}