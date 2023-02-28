const gen = require('./generator.js');

const RoutineRestApiGenerator = class extends gen.Generator{
    constructor(){
        super();
        if (this.constructor == RoutineRestApiGenerator) {
            throw new Error("The abstract routine generator cannot be instantiated.");
        }
    }

    generate(entityData, databaseConfiguration, restApiName, provider){
        throw new Error("generate(entityData, databaseConfiguration, restApiName, provider) must be implemented!");
    }
}

module.exports = {
    RoutineRestApiGenerator
}