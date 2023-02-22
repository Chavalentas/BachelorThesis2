import { Helper } from "./helper-functions.js";
import { NodeConfigGenerator } from "./node-config-generator.js";

export class RoutineRestApiGenerator{
    constructor(){
        this.usedids = [];
        this.nodeConfGen = new NodeConfigGenerator();
        this.helper = new Helper();
    }
}