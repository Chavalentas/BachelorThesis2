const routineGen = require('./routine-rest-api-generator.js');

const  StoredProcedureRestApiGenerator =  class extends routineGen.RoutineRestApiGenerator{
    generate(entityData, databaseConfiguration, restApiName, provider){
        
    }
}

module.exports = {
    StoredProcedureRestApiGenerator
}

