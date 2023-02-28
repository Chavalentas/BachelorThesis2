const routineGen = require('./routine-rest-api-generator.js');

const FunctionRestApiGenerator = class extends routineGen.RoutineRestApiGenerator{
    generate(entityData, databaseConfiguration, restApiName, provider){
        let config = [];
    
        // Start coordinates
        let startX = 150;
        let startY = 140;
        let x = startX;
        let y = startY;

        // Flow tab
        let flowTabId = this.helper.generateId(16, this.usedids);
        this.usedids.push(flowTabId);
        let flowTabNode = this.nodeConfGen.generateFlowTabNode(restApiName, flowTabId);
    
        // Db config
        let dbConfigNodeId = this.helper.generateId(16, this.usedids);
        this.usedids.push(dbConfigNodeId);
        let dbConfigNode = this.nodeConfGen.generateDatabaseConfigNode(databaseConfiguration, dbConfigNodeId, provider);

        // Header
        let headerCommentId = this.helper.generateId(16, this.usedids);
        let headerComment = this.nodeConfGen.generateCommentNode(headerCommentId, restApiName, x + 300, y, flowTabId, []);
    
        config.push(headerComment);
        config.push(flowTabNode);
        config.push(dbConfigNode);

        y += 100;

        // Subflow that catches the errors
        let catchCommentId = this.helper.generateId(16, this.usedids);
        let catchComment = this.nodeConfGen.generateCommentNode(catchCommentId, "This subflow catches the errors", x + 300, y, flowTabId, []);
        config.push(catchComment);
        y += 50;
        let catchSublow = this.generateCatchSubFlow(x, 250, y, flowTabId);
        y += 100;
        let getCommentId = this.helper.generateId(16, this.usedids);
        let getComment = this.nodeConfGen.generateCommentNode(getCommentId, "GetEndPoint (table attributes are query parameters)", x + 300, y, flowTabId, []);
        config.push(getComment);

        y += 50;

        // The endpoints
        
    }
}

module.exports = {
    FunctionRestApiGenerator
}