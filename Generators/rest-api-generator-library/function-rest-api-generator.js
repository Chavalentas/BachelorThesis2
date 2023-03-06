const routineGen = require('./routine-rest-api-generator.js');

const FunctionRestApiGenerator = class extends routineGen.RoutineRestApiGenerator{
    constructor(){
        super();
        if (this.constructor == FunctionRestApiGenerator) {
            throw new Error("The abstract function generator cannot be instantiated.");
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

    generateCheckFunctionParametersCode(entityData, prefix){
        if (this.helper.isNullOrUndefined(entityData)){
            throw new Error('The parameter entityData was null or undefined!');
        }

        if (this.helper.isNullOrUndefined(prefix)){
            throw new Error('The parameter prefix was null or undefined!');
        }

        var ifCodes = [];
        for (let i = 0; i < entityData.parameters.length; i++){
            var ifCode = `\nif (${prefix}[\'${entityData.parameters[i].parameterName}\'] === undefined){\n    throw new Error(\`The parameter ${entityData.parameters[i].parameterName} was not defined!\`);\n}\n`;
            ifCodes.push(ifCode);
        }

        var parameterPushes = [];
        for (let i = 0; i < entityData.parameters.length; i++){
            var parameterPush = `msg.functionParameters.push({\"parameterName\" : \"${entityData.parameters[i].parameterName}\", \"parameterValue\" : msg.req.query['${entityData.parameters[i].parameterName}']});`;
            parameterPushes.push(parameterPush);
        }

        var parametersInString = entityData.parameters.map(p => `\"${p.parameterName}\"`);

        var code = `var parameters = [${parametersInString.join(",")}];\nvar queryParameters = Object.getOwnPropertyNames(msg.req.query);\n\nif (queryParameters.some(p => !parameters.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query parameter detected!\");\n}\n${ifCodes.join("\n\n")}\nmsg.functionParameters = [];\n${parameterPushes.join("\n")}\n\nreturn msg;`
        return code;
    }
}

module.exports = {
    FunctionRestApiGenerator
}