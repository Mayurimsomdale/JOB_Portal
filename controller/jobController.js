// import mongoose from "mongoose";

import mongoose from "mongoose";
import jobsmodel from "../models/jobsmodel.js";
import { rejects } from "assert";

export const createJobController=async(req,res,next)=>{
const { company, position }=req.body;
if(!company||!position){
    next("please proavide all fields");
}
req.body.createBy=req.user.userId;
const job = await jobsmodel.create(req.body);
res.status(201).json({job});
};

//create Jobs

export const getAllController=async(req,res,next)=>{
  const {status}=req.query
  //condition for searching
  const queryObject={
    createdBy:req.user.userId

  }
  if(status&& status!=='all'){
    queryObject.status=status;

  }
  
  const queryResult=jobsmodel.find(queryObject);
  const jobs= await queryResult ;

    // const jobs=await jobsmodel.find({createBy:req.user.userId});
    res.status(200).json({
        totalJobs:jobs.length,
        jobs,
    });

};

//update jobs
export const updateController=async(req,res,next)=>{
  const {id}=req.params;  
  const {company,position}=req.body;
  //validation
  if(!company||!position){
    next("please provide all fields");
  }
  //find job
  const job= await jobsmodel.findOne({_id:id});
  //calidation
  if(!job){
    next(`no jobs found with id ${id}`);
  }
  if(!req.user.userId === job.createBy.toString()){
    next("you not Authorized to update this job");
    return;
  }
  const updateJob= await jobsmodel.findOneAndUpdate({_id:id},req.body,{
    new:true,
    runValidators:true
  });
  res.status(200).json({updateJob});
};

// DELETE JOBs

export const deleteJobController=async(req,res,next)=>{
    const {id}=req.params;
    //find jbo
    const job=await jobsmodel.findOne({_id:id});
    if(!job){
        next(`no job find with this id${id}`);
    }
    if(!req.user.userId===job.createBy.toString()){
        next(" you not authorized t delete this job");
        return;
    }
    await job.deleteOne();
        res.status(200).json({message:"success , job deleted"});
    };

    //job stats and filter

    export const jobStatsController = async(req,res)=>{
      const  stats=await jobsmodel.aggregate([
       //search by user jobs
        {
          $match:{
            createdBy:new mongoose.Types.ObjectId(req.user.userId), 
          },
         
        },
        {
          $group:{
            _id:'$status',
            count:{$sum:1},
          }
        },
      ]);
      const defaultStats={
        pending:stats.pending||0,
        reject:stats.reject||0,
        interview:stats.interview||0
      };
      //monthly year
      let monthlyApp=await jobsmodel.aggregate([
        {
          $match:{
            createdBy:new mongoose.Types.ObjectId(req.user.UserId)
          },
          
        },
        {
          $group:{
            _id:{
              year:{$year:'$createdBy'},
              month:{$month:'$createdBy'},

            },
            count:{
              $sum:1
            },
          },
        },
      ]);
      res.status(200).json({totalJob:stats.length, defaultStats,monthlyApp});
    };

    // QUERY STRING :in searching bar use the question mark and object afet question mark
