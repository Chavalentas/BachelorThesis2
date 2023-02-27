const relGen = require('./relation-rest-api-generator.js');

const TableRestApiGenerator = class extends relGen.RelationRestApiGenerator{
    generate(entityData, databaseConfiguration, restApiName, provider){
        return super.generate(entityData, databaseConfiguration, restApiName, provider);
    }
}

module.exports = {
    TableRestApiGenerator
}