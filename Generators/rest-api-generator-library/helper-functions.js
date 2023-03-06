const Helper = class{
    generateId(length, except){
        if (this.isNullOrUndefined(length)){
            throw new Error('The parameter length was null or undefined!');
        }

        if (this.isNullOrUndefined(except)){
            throw new Error('The parameter except was null or undefined!');
        }

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
        if (this.isNullOrUndefined(min)){
            throw new Error('The parameter min was null or undefined!');
        }

        if (this.isNullOrUndefined(max)){
            throw new Error('The parameter max was null or undefined!');
        }

        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }

    isNullOrUndefined(value){
        return value === null || value === undefined;
    }
}

module.exports = {
    Helper
}