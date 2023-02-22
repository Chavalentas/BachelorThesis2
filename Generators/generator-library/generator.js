import { Helper } from "./helper-functions.js";
import { NodeConfigGenerator } from "./node-config-generator.js";

export class Generator{
    constructor(){
        if (this.constructor == Generator) {
            throw new Error("The abstract generator cannot be instantiated.");
        }

        this.usedids = [];
        this.nodeConfGen = new NodeConfigGenerator();
        this.helper = new Helper();
    }

    generate(entityData, databaseConfiguration, restApiName, provider){
        throw new Error("Method 'generate(entityData, databaseConfiguration, restApiName, provider' must be implemented.");
    }
}