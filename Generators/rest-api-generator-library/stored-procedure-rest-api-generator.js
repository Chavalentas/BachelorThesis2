const routineGen = require('./routine-rest-api-generator.js');

const StoredProcedureRestApiGenerator = class extends routineGen.RoutineRestApiGenerator{
    constructor(){
        super();
        if (this.constructor == StoredProcedureRestApiGenerator) {
            throw new Error("The abstract stored procedure generator cannot be instantiated.");
        }
    }

    generate(entityData, databaseConfiguration, restApiName){
        throw new Error("generate(entityData, databaseConfiguration, restApiName) must be implemented!");
    }

    generateCheckProcedureParametersCode(entityData, prefix){
        var ifCodes = [];
        for (let i = 0; i < entityData.parameters.length; i++){
            var ifCode = `\nif (${prefix}[\'${entityData.parameters[i].parameterName}\'] === undefined){\n    throw new Error(\`The parameter ${entityData.parameters[i].parameterName} was not defined!\`);\n}\n`;
            ifCodes.push(ifCode);
        }

        var parameterPushes = [];
        for (let i = 0; i < entityData.parameters.length; i++){
            var parameterPush = `msg.procedureParameters.push({\"parameterName\" : \"${entityData.parameters[i].parameterName}\", \"parameterValue\" : msg.req.query['${entityData.parameters[i].parameterName}']});`;
            parameterPushes.push(parameterPush);
        }

        var parametersInString = entityData.parameters.map(p => `\"${p.parameterName}\"`);

        var code = `var parameters = [${parametersInString.join(",")}];\nvar queryParameters = Object.getOwnPropertyNames(msg.req.query);\n\nif (queryParameters.some(p => !parameters.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query parameter detected!\");\n}\n${ifCodes.join("\n\n")}\nmsg.procedureParameters = [];\n${parameterPushes.join("\n")}\n\nreturn msg;`
        return code;
    }
}

module.exports = {
    StoredProcedureRestApiGenerator
}

