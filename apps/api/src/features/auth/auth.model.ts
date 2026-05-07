import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email : {type : String , unique : true  , sparse : true},
    name : String,
    avatar : String,
}, { timestamps: true })


const authProviderSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId , ref : "User"},
    provider : {type : String , enum : ["github"] , default : "github"},
    providerId : {type : String , required : true},
    accessToken : {type : String , required : true}
}, { timestamps: true })
authProviderSchema.index({ provider: 1, providerId: 1 }, { unique: true }),
authProviderSchema.index({ userId: 1 })

const UserModel = mongoose.model("User" , userSchema)
const AuthProvider = mongoose.model("AuthProvider" , authProviderSchema)


export {UserModel , AuthProvider}
