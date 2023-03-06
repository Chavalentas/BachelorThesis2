const relGen = require('./relation-rest-api-generator.js');

const TableRestApiGenerator = class extends relGen.RelationRestApiGenerator{
    constructor(){
        super();
        if (this.constructor == TableRestApiGenerator) {
            throw new Error("The abstract table generator cannot be instantiated.");
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

    generateQueryProperties(entityData, prefix){
        if (this.helper.isNullOrUndefined(entityData)){
            throw new Error('The parameter entityData was null or undefined!');
        }

        if (this.helper.isNullOrUndefined(prefix)){
            throw new Error('The parameter prefix was null or undefined!');
        }

        return super.generateQueryProperties(entityData, prefix);
    }

    generateJsonPropertiesCode(properties, prefix){
        if (this.helper.isNullOrUndefined(properties)){
            throw new Error('The parameter properties was null or undefined!');
        }

        if (this.helper.isNullOrUndefined(prefix)){
            throw new Error('The parameter prefix was null or undefined!');
        }

        return super.generateJsonPropertiesCode(properties, prefix);
    }

    generateRequestBodyChecks(properties){
        if (this.helper.isNullOrUndefined(properties)){
            throw new Error('The parameter properties was null or undefined!');
        }
        
        return super.generateRequestBodyChecks(properties);
    }
}

module.exports = {
    TableRestApiGenerator
}