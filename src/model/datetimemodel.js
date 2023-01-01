const mongoose = require("mongoose");


const datetimeModel = new mongoose.Schema(
  {
   
    date: { type: String},

    time: [String],


  },

  { timestamps: true }
);




module.exports = mongoose.model("datetime", datetimeModel);