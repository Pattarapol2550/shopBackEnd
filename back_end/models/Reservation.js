const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    apptDate:{
        type:Date,
        required : true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    shop:{
        type:mongoose.Schema.ObjectId,
        ref:'Shop',
        required :true
    },
    masseuse:{
   type: mongoose.Schema.ObjectId,
   ref:'Masseuse',
   default:null
},
    createdAt:{
        type:Date,
        default :Date.now
    }
});

module.exports=mongoose.model('Reservation',ReservationSchema);