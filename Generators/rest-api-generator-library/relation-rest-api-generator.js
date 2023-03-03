const gen = require('./generator.js');

const RelationRestApiGenerator = class extends gen.Generator{
    constructor(){
        super();
        if (this.constructor == RelationRestApiGenerator) {
            throw new Error("The abstract relation generator cannot be instantiated.");
        }
    }

    generate(entityData, databaseConfiguration, restApiName){
        throw new Error("generate(entityData, databaseConfiguration, restApiName) must be implemented!");
    }

    generateQueryProperties(entityData, prefix){
        var ifCodes = [];
        for (let i = 0; i < entityData.properties.length; i++){
            var ifCode = `\nif (${prefix}.${entityData.properties[i].propertyName} !== undefined){\n    msg.queryProperties.push({\"propertyName\": \"${entityData.properties[i].propertyName}\", \"propertyValue\" : \`\${${prefix}.${entityData.properties[i].propertyName}}\`});\n}\n`;
            ifCodes.push(ifCode);
        }

        var propertiesInString = entityData.properties.map(p => `\"${p.propertyName}\"`);
        var code = `msg.queryProperties = [];\nvar properties = [${propertiesInString.join(",")}];\nvar queryProperties = Object.getOwnPropertyNames(msg.req.query);\n\nif (queryProperties.some(p => !properties.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query property detected!\");\n}\n\nif (queryProperties.some(p => !properties.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query property detected!\");\n}\n${ifCodes.join("\n\n")}\n\nreturn msg;`;
        return code;
    }

    generateJsonPropertiesCode(properties, prefix){
        let result = '';

        for (let i = 0; i < properties.length; i++){
            result += `\n    ${properties[i].propertyName} : ${prefix}.${properties[i].propertyName},`;
        }

        return result;
    }

    generateRequestBodyChecks(properties){
        var ifCodes = [];
        for (let i = 0; i < properties.length; i++){
            var ifCode = `if (msg.req.body.${properties[i].propertyName} === undefined){\n    throw new Error('The body parameter \\'${properties[i].propertyName}\\' was undefined!');\n}`;
            ifCodes.push(ifCode);
        }

        var result = ifCodes.join("\n\n");
        return result;
    }
}

module.exports = {
    RelationRestApiGenerator
}