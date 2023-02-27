const gen = require('./generator.js');

const RoutineRestApiGenerator = class extends gen.Generator{
    generate(entityData, databaseConfiguration, restApiName, provider){
        let config = [];
        return config;
    }
}

module.exports = {
    RoutineRestApiGenerator
}