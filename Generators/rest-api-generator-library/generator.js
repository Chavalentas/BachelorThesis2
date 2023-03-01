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

    generateCatchSubFlow(startX, xOffset, startY, flowId){
        let x = startX;
        let y = startY;

        // Step 1: Generate the catch node
        let catchNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(catchNodeId);
        let nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let catchNode = this.nodeConfGen.generateCatchErrorNode(catchNodeId, null, x, y, flowId, [nextNodeId]);

        x += xOffset;

        // Step 2: Generate the create error node
        let functionCode = "// Store the error message \n// in the payload property.\nmsg.payload = {\n    \"error\" : msg.error\n}\nreturn msg;";
        let functionNodeId = nextNodeId;
        nextNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(nextNodeId);
        let functionNode = this.nodeConfGen.generateFunctionNode(functionNodeId, "CreateError", x, y, flowId, functionCode, [nextNodeId]);

        x += xOffset;

        // Step 3: Generate the response node
        let respondeNodeId = nextNodeId;
        let responseNode = this.nodeConfGen.generateHttpResponseNode(respondeNodeId, 400, x, y, flowId);
 
        let resultingNodes = [catchNode, functionNode, responseNode];
        return resultingNodes;
    }
}

module.exports = {
    Generator
}