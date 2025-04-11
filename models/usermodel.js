//to create schema using mongoose
import { timeStamp } from "console";
import mongoose from "mongoose";
import { type } from "os";
import validator from 'validator'
import bcrypt from "bcryptjs";
import JWT from 'jsonwebtoken'
//schema
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is required"],
    },
    lastName:{
        type:String,

    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        validate:validator.isEmail,
    },
    password:{
        type:String,
        required:[true,'password is requires'],
        minlength:[6,"password must be greater than 6"],
        select:true,
    },
    location:{
        type:String,
        default:'pune',
    }


},{timeStamps: true});
//for encrypt password ie to showing the any random alphabates
userSchema.pre('save',async function(){
 if(!this.isModified) return;   
const salt=await bcrypt.genSalt(10);
this.password=await bcrypt.hash(this.password, salt);
});

// compare password

userSchema.methods.comparePassword=async function(userpassword){
    const isMatch=await bcrypt.compare(userpassword, this.password);
    return isMatch;
};

//Json web tokan
userSchema.methods.createJWT= function(){
    return JWT.sign(
        {userId:this._id},
        process.env.JWT_SECRET,{
        expiresIn:'7d'
    });//to create a token like url link which is showing  use sign method
};
export default mongoose.model('user',userSchema);