import { Helper } from "./helper-functions.js";
import { NodeConfigGenerator } from "./node-config-generator.js";
import { RelationRestApiGenerator } from "./relation-rest-api-generator.js";

export class TableRestApiGenerator extends RelationRestApiGenerator{
    generate(entityData, databaseConfiguration, restApiName, provider){
        return super.generate(entityData, databaseConfiguration, restApiName, provider);
    }
}