const gen = require('./stored-procedure-rest-api-generator.js');

const PostgresStoredProcedureRestApiGenerator = class extends gen.StoredProcedureRestApiGenerator{
    generate(entityData, databaseConfiguration, restApiName){
       // Todo
    }
}

module.exports = {
    PostgresStoredProcedureRestApiGenerator
}