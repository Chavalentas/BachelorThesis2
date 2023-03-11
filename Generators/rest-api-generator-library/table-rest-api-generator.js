const relGen = require('./relation-rest-api-generator.js');

const TableRestApiGenerator = class extends relGen.RelationRestApiGenerator{
    constructor(){
        super();
        if (this.constructor == TableRestApiGenerator) {
            throw new Error("The abstract table generator cannot be instantiated.");
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

    generateQueryProperties(objectData, prefix){
        if (this.helper.isNullOrUndefined(objectData)){
            throw new Error('The parameter objectData was null or undefined!');
        }

        if (this.helper.isNullOrUndefined(prefix)){
            throw new Error('The parameter prefix was null or undefined!');
        }

        return super.generateQueryProperties(objectData, prefix);
    }

    generateRequestBodyPushes(properties){
        if (this.helper.isNullOrUndefined(properties)){
            throw new Error('The parameter properties was null or undefined!');
        }
        
        return super.generateRequestBodyPushes(properties);
    }
}

module.exports = {
    TableRestApiGenerator
}