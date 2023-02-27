const Helper = class{
    generateId(length, except){
        var id = "";
    
        do {
           for (let i = 0; i < length; i++){
               // 0 false -> letter, 1 true
               let shouldBeNumber = this.getRandomInt(0, 2);
    
               if (shouldBeNumber){
                   id += this.getRandomInt(0, 10);
               } else{
                   id += String.fromCharCode(this.getRandomInt(97,123));
               }
           }
       } while (except.includes(id));
    
        return id;
    }
    
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }
}

module.exports = {
    Helper
}