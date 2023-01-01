const mongoose = require("mongoose");


const userModel = new mongoose.Schema(
  {
   
    Name: { type: String, required: true},

    PhoneNumber: { type: Number, required: true, unique: true },

    password:{ type: String, required: true, unique: true },

    dose:{type:String, enum:["1st dose","2nd dose"],default:"1st dose"},

    date:{type:String},

    time:{type:String},

    isadmine:{type:Boolean,default:false},

    vaccination_status :{type:String,enum:["none","First dose completed","All"],default:"none"},

    Age: { type: Number, required: true },

    Pincode: { type: Number, required: true},

    AadharNo: { type: Number, required: true, unique: true},

  },

  { timestamps: true }
);




module.exports = mongoose.model("user", userModel);