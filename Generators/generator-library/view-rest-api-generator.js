import { Helper } from "./helper-functions.js";
import { NodeConfigGenerator } from "./node-config-generator.js";
import { RelationRestApiGenerator } from "./relation-rest-api-generator.js";

export class ViewRestApiGenerator extends RelationRestApiGenerator{
    constructor(){
        super();
        this.usedids = [];
        this.nodeConfGen = new NodeConfigGenerator();
        this.helper = new Helper();
    }

    generate(entityData, databaseConfiguration, restApiName, provider){
        return super.generate(entityData, databaseConfiguration, restApiName, provider);
    }
}