const relGen = require('./relation-rest-api-generator.js');

const ViewRestApiGenerator = class extends relGen.RelationRestApiGenerator{
    constructor(){
        super();
        if (this.constructor == ViewRestApiGenerator) {
            throw new Error("The abstract view generator cannot be instantiated.");
        }
    }

    generate(entityData, databaseConfiguration, restApiName){
        throw new Error("generate(entityData, databaseConfiguration, restApiName) must be implemented!");
    }

    generateQueryProperties(entityData, prefix){
        var ifCodes = [];
        for (let i = 0; i < entityData.properties.length; i++){
            var ifCode = `\nif (${prefix}.${entityData.properties[i].propertyName} != undefined){\n    msg.queryProperties.push({\"propertyName\": \"${entityData.properties[i].propertyName}\", \"propertyValue\" : \`\${${prefix}.${entityData.properties[i].propertyName}}\`});\n}\n`;
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
}

module.exports = {
    ViewRestApiGenerator
}