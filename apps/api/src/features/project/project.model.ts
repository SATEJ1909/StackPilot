import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name : {type : String , required : true , trim : true},
    userId : {type : mongoose.Schema.Types.ObjectId , ref : "User" , required : true , index : true},
    repoUrl : {type : String , required : true , unique : true},
    projectKey : {type : String , required : true , unique : true},
});

const ProjectModel = mongoose.model("Project" , projectSchema)

export {ProjectModel}