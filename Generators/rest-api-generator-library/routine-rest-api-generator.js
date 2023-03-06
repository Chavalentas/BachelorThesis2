const gen = require('./generator.js');

const RoutineRestApiGenerator = class extends gen.Generator{
    constructor(){
        super();
        if (this.constructor == RoutineRestApiGenerator) {
            throw new Error("The abstract routine generator cannot be instantiated.");
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
    RoutineRestApiGenerator
}