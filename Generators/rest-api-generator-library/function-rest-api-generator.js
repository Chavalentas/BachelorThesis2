import { RoutineRestApiGenerator } from "./routine-rest-api-generator.js";

export class FunctionRestApiGenerator extends RoutineRestApiGenerator{
    generate(entityData, databaseConfiguration, restApiName, provider){
        return super.generate(entityData, databaseConfiguration, restApiName, provider);
    }
}