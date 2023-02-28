const routineGen = require('./routine-rest-api-generator.js');

const FunctionRestApiGenerator = class extends routineGen.RoutineRestApiGenerator{
    generate(entityData, databaseConfiguration, restApiName, provider){
        let config = [];

        //
    }
}

module.exports = {
    FunctionRestApiGenerator
}