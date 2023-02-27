const help = require('./helper-functions.js');
const nodeConfigGen = require('./node-config-generator.js');

const Generator = class{
    constructor(){
        if (this.constructor == Generator) {
            throw new Error("The abstract generator cannot be instantiated.");
        }

        this.usedids = [];
        this.nodeConfGen = new nodeConfigGen.NodeConfigGenerator();
        this.helper = new help.Helper();
    }

    generate(entityData, databaseConfiguration, restApiName, provider){
        throw new Error("Method 'generate(entityData, databaseConfiguration, restApiName, provider' must be implemented.");
    }
}

module.exports = {
    Generator
}