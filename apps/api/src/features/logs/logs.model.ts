import mongoose  from "mongoose";

const logSchema = new mongoose.Schema({
    projectId : {type : mongoose.Schema.Types.ObjectId , ref : "Project" , required : true},
    errorGroupId : {type : mongoose.Schema.Types.ObjectId , ref : "Error" },
    message : String ,
    stack : String,
    route : String
})

const LogModel = mongoose.model("Log" , logSchema)

export {LogModel}