import mongoose from "mongoose";

const errorGroupSchema = new mongoose.Schema({
    projectId : {type : mongoose.Schema.Types.ObjectId , ref : "Project" , required : true , index : true},
    hash : {type : String , required : true},
    message : {type : String , required : true},
    route : {type : String},
    count : {type : Number , default : 1},
    lastSeenAt : {type : Date , default : Date.now},
    aiFix : {type : String},
})
errorGroupSchema.index({ projectId: 1, hash: 1 }, { unique: true });


const ErrorModel = mongoose.model("Error" , errorGroupSchema)
export {ErrorModel}