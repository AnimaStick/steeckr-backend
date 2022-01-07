let UpdateBuilder = class{
    constructor(table){
        this.fields = [];
        this.params = [];
        this.nextParamNumber = 1;
        this.table = table;
        this.values = []; 
    }
    insertValue(field, value){
        this.fields.push(field);
        this.params.push(`$${this.nextParamNumber}`);
        this.values.push(value);
        this.nextParamNumber++;
    }
    get updateString(){
        let paramSet = this.fields[0]+"="+this.params[0];
        for(let i = 1; i < this.fields.length; i++){
            paramSet += `,${this.fields[i]}=${this.params[i]}`;
        }
        return `UPDATE "${this.table}" SET ${paramSet} WHERE "id"=$${this.nextParamNumber} RETURNING id`; 
    }
    get updateQuery(){
        return{
            text: this.updateString,
            values: this.values
        }
    }
}
module.exports = UpdateBuilder;