const mongoose = require('mongoose');
//const Hospital = require('../../a-7-Pattarapol2550/models/Hospital');

const ShopSchema = new mongoose.Schema({
    name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxLength: [50, 'Name can not be more than 50 characters']
},
address: {
    type: String,
    required: [true, 'Please add an address']
},
telephone: {
    type: String
},
openTime: {
    type : String
},
closeTime :{
    type : String
}

},{
    toJSON:{virtuals:true },
    toObject:{virtuals:true}
});

//Reverse populate with virsual
ShopSchema.virtual('reservations',{
  ref:'Shop',
  localField:'_id',
  foreignField:'shop',  
  justOne:false
});

ShopSchema.virtual('masseuses',{
    ref:'Masseuse',
    localField:'_id',
    foreignField:'shop',
    justOne:false
});

module.exports = mongoose.model('Shop', ShopSchema);