//const Hospital = require('../models/Shop.js');
//const Appointment = require('../models/Reservation.js');
const Reservation = require('../models/Reservation.js');
const Shop = require('../models/Shop.js');
exports.getShops = async (req, res, next) => {

    let query;
    //copy req.query
    const reqQuery = {...req.query};

    //fields to exclude
    const removeFields =['select','sort','page','limit'];

    //loop
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    //create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);

    query = Shop.find(JSON.parse(queryStr)).populate('reservations');

    //select fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //sort
    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query=query.sort('-createdAt');
    }

    //Pagination
    const page=parseInt(req.query.page,10)||1;
    const limit = parseInt(req.query.limit,10)||25;
    const startIndex=(page-1)*limit;
    const endIndex = page*limit;
    const total = await Shop.countDocuments();

    query=query.skip(startIndex).limit(limit);

    try{
    
        const  shops = await query;
        const pagination ={};
        if(endIndex < total){
            pagination.next={
            page:page+1,
            limit
         }
        }
        if(startIndex > 0){
            pagination.prev={
                page:page-1,
                limit

            }
        }
         res.status(200).json({ success: true,count:shops.length,pagination, data:shops });

    }catch(err){
        res.status(400).json({success:false});
    }
   
};

exports.getShop = async (req, res, next) => {
   try{
    const shop = await Shop.findById(req.params.id);

    if(!shop){
        return  res.status(400).json({ success: false });
    }

     res.status(200).json({ success: true, data : shop });
   }catch(err){
    res.status(400).json({success:false});
   }
};

exports.createShop = (req, res, next) => {
    
    res.status(200).json({ success: true, msg: 'Create new shops' });
};

exports.updateShop = async(req, res, next) => {
    try{
        const shop = await Shop.findByIdAndUpdate(req.params.id ,req.body,{
            new : true,
            runValidators : true
        });
        if(!shop){
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true,data : shop});
    }catch(err){
        res.status(400).json({success:false});
    }
};

exports.deleteShop = async(req, res, next) => {
   try{
     const shop = await Shop.findById(req.params.id);

if (!shop) {
    return res.status(404).json({
        success: false,
        message: `MassageShop not found with id of ${req.params.id}`
    });
}

await Reservation.deleteMany({ shop: req.params.id });
await Shop.deleteOne({ _id: req.params.id });

res.status(200).json({
    success: true,
    data: {}
});
   }catch(error){
         res.status(400).json({success:false});
   }
};

exports.createShop= async(reg,res,next)=>{
    const shop = await Shop.create(reg.body);
    res.status(201).json({success:true , data:shop});
};