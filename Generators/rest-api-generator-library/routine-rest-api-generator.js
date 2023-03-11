const gen = require('./generator.js');

const RoutineRestApiGenerator = class extends gen.Generator{
    constructor(){
        super();
        if (this.constructor == RoutineRestApiGenerator) {
            throw new Error("The abstract routine generator cannot be instantiated.");
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
    RoutineRestApiGenerator
}