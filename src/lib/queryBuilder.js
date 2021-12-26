let QueryBuilder = class{
    constructor(fields, params, nextParamNumber, table, values){
        this.fields = fields;
        this.params = params;
        this.nextParamNumber = nextParamNumber;
        this.table = table;
        this.values = values; 
    }
    insertValue(field, value){
        this.fields += `,${field}`;
        this.params += `,$${this.nextParamNumber}`;
        this.values.push(value);
        this.nextParamNumber++;
    }
    get query(){
        return{
            text: this.queryString,
            values: this.values
        }
    }
    get queryString(){
        return `INSERT INTO "${this.table}" (${this.fields}) VALUES (${this.params}) RETURNING id`; 
    }
}
module.exports = QueryBuilder;