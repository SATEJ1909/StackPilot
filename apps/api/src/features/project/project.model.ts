import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name : {type : String , required : true},
    userId : {type : mongoose.Schema.Types.ObjectId , ref : "User" , required : true},
    repoUrl : {type : String ,},
    projectKey : {type : String , required : true , unique : true},
});

const ProjectModel = mongoose.model("Project" , projectSchema)

export {ProjectModel}