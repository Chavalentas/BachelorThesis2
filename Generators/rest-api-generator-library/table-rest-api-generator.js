const relGen = require('./relation-rest-api-generator.js');

const TableRestApiGenerator = class extends relGen.RelationRestApiGenerator{
    constructor(){
        super();
        if (this.constructor == TableRestApiGenerator) {
            throw new Error("The abstract table generator cannot be instantiated.");
        }
    }

    generate(entityData, databaseConfiguration, restApiName){
        throw new Error("generate(entityData, databaseConfiguration, restApiName) must be implemented!");
    }

    generateQueryProperties(entityData, prefix){
        return super.generateQueryProperties(entityData, prefix);
    }

    generateJsonPropertiesCode(properties, prefix){
        return super.generateJsonPropertiesCode(properties, prefix);
    }
}

module.exports = {
    TableRestApiGenerator
}