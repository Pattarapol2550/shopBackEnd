const Masseuse = require('../models/Masseuse');
const Shop = require('../models/Shop');
const Reservation = require('../models/Reservation');

exports.getSingleMasseuse = async (req,res)=>{
    try{
        const masseuse = await Masseuse.findById(req.params.id)
        .populate({
            path:'shop',
            select:'name address telephone'
        });

        if(!masseuse){
            return res.status(404).json({
                success:false,
                message:"No masseuse found"
            });
        }

        res.status(200).json({
            success:true,
            data:masseuse
        });

    }catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            message:"Server error"
        });
    }
};

exports.addMasseuse = async (req,res)=>{
    if(req.user.role !== 'admin'){
        return res.status(403).json({
            success:false,
            message:"You are not allowed to add masseuse"
        });
    }

    try{
        req.body.shop = req.params.shopId;

        const shop = await Shop.findById(req.params.shopId);
        if(!shop){
            return res.status(404).json({success:false,message:'No shop'});
        }

        const masseuse = await Masseuse.create(req.body);

        const populated = await masseuse.populate({
            path:'shop',
            select:'name '
        });

        res.status(200).json({
            success:true,
            data: populated
        });

    }catch(err){
        console.log(err);
        res.status(500).json({success:false});
    }
};

exports.getMasseuses = async(req,res)=>{
   const data = await Masseuse.find({shop:req.params.shopId}).populate({
        path:'shop',
        select:'name address telephone'
   });
   res.json({success:true,
    count: data.length
    ,data});
};

exports.getAllMasseuses = async (req,res)=>{
    try{
        const masseuses = await Masseuse.find().populate({
            path:'shop',
            select:'name address telephone'
        });

        res.status(200).json({
            success:true,
            count: masseuses.length,
            data: masseuses
        });

    }catch(err){
        console.log(err);
        res.status(500).json({success:false});
    }
};

exports.deleteMasseuse = async (req,res)=>{
    if(req.user.role !== 'admin'){
            return res.status(403).json({
                success:false,
                message:"You are not allowed to delete masseuse"
            });    
    }
    try{
        const masseuse = await Masseuse.findById(req.params.id);

        if(!masseuse){
            return res.status(404).json({
                success:false,
                message:"No masseuse found"
            });
        }
        // ใครจองหมอคนนี้ ข้อมูลหมอจะเป็น null แทน
        await Reservation.updateMany(
            { masseuse: masseuse._id },
            { $set: { masseuse: null } }
        );

        await masseuse.deleteOne();

        res.status(200).json({
            success:true,
             message:`Masseuse : ${masseuse.name} (ID: ${masseuse._id}) has been removed`
        });

    }catch(err){
        console.log(err);
        res.status(500).json({success:false});
    }
};

exports.updateMasseuse = async (req,res)=>{
    try{
        const masseuse = await Masseuse.findById(req.params.id);

        if(!masseuse){
            return res.status(404).json({
                success:false,
                message:"No masseuse found"
            });
        }

        if(req.user.role !== 'admin'){
            return res.status(403).json({
                success:false,
                message:"You are not allowed to update masseuse"
            });
        }

        const updateData = {};

        if(req.body.telephone){
            updateData.telephone = req.body.telephone;
        }

        if(req.body.shop){

            if(masseuse.shop.toString() === req.body.shop){
                return res.status(400).json({
                    success:false,
                    message:"This masseuse is already in this shop"
                });
            }
            const shop = await Shop.findById(req.body.shop);
            if(!shop){
                return res.status(404).json({
                    success:false,
                    message:"No shop found"
                });
            }

            await Reservation.updateMany(
            { masseuse: masseuse._id },
            { $set: { masseuse: null } });
            updateData.shop = req.body.shop;
        }

        const updated = await Masseuse.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new:true, runValidators:true }
        ).populate({
            path:'shop',
            select:'name address'
        });

        res.status(200).json({
            success:true,
            data:updated,
            message:`Masseuse : ${updated.name} updated`
        });

    }catch(err){
        console.log(err);
        res.status(500).json({success:false});
    }
};