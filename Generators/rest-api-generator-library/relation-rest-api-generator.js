const gen = require('./generator.js');

const RelationRestApiGenerator = class extends gen.Generator{
    constructor(){
        super();
        if (this.constructor == RelationRestApiGenerator) {
            throw new Error("The abstract relation generator cannot be instantiated.");
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

        var ifCodes = [];
        for (let i = 0; i < objectData.properties.length; i++){
            var ifCode = `\nif (${prefix}.${objectData.properties[i].propertyName} !== undefined){\n    msg.queryProperties.push({\"propertyName\": \"${objectData.properties[i].propertyName}\", \"propertyValue\" : \`\${${prefix}.${objectData.properties[i].propertyName}}\`});\n}\n`;
            ifCodes.push(ifCode);
        }

        var propertiesInString = objectData.properties.map(p => `\"${p.propertyName}\"`);
        var code = `msg.queryProperties = [];\nvar properties = [${propertiesInString.join(",")}];\nvar queryProperties = Object.getOwnPropertyNames(msg.req.query);\n\nif (queryProperties.some(p => !properties.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query property detected!\");\n}\n\nif (queryProperties.some(p => !properties.some(p1 => p1 == p))){\n    throw new Error(\"Invalid query property detected!\");\n}\n${ifCodes.join("\n\n")}\n\nreturn msg;`;
        return code;
    }

    generateRequestBodyPushes(properties){
        if (this.helper.isNullOrUndefined(properties)){
            throw new Error('The parameter properties was null or undefined!');
        }
        
        var ifCodes = [];
        for (let i = 0; i < properties.length; i++){
            var ifCode = `if (msg.req.body.${properties[i].propertyName} !== undefined){\n    msg.queryProperties.push({ \"propertyName\": \"${properties[i].propertyName}\", \"propertyValue\": \`\${msg.req.body.${properties[i].propertyName}}\` })\n}`;
            ifCodes.push(ifCode);
        }

        var result = ifCodes.join("\n\n");
        return result;
    }
}

module.exports = {
    RelationRestApiGenerator
}