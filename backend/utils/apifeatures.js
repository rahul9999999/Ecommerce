class Apifeatures {
    constructor(query,querystr){
        this.query=query,
        this.querystr=querystr
    }
    
    search(){
        const keyword=this.querystr.keyword ?
        {
            name:{
                $regex:this.querystr.keyword,
                $options:"i"
            }
        }:{};
        
        this.query=this.query.find({...keyword})
        return this;
        
    }
    filter(){
        const querycopy={...this.querystr}
        const removeField=["keyword","page","limit"]
        removeField.forEach((key)=> delete querycopy[key])
         
        let queryStr =JSON.stringify(querycopy)
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(key)=>`$${key}`)
        
        
        this.query=this.query.find(JSON.parse(queryStr))
        return this;
    }
    pagination(resultPerPage){
        const currPage=Number(this.querystr.page) || 1;

        const skip= resultPerPage *(currPage-1);

        this.query=this.query.limit(resultPerPage).skip(skip);
        return this;


    }
}
module.exports = Apifeatures ;