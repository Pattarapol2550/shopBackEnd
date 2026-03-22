const Reservation = require('../models/Reservation');
const Shop = require('../models/Shop');
const Masseuse = require('../models/Masseuse');
//const { patch } = require('../routes/reservations');

exports.getReservations = async (req, res, next) => {
    let query;

    if (req.user.role !== 'admin') {
        query = Reservation.find({ user: req.user.id }).populate({
            path: 'shop',
            select: 'name address telephone openTime closeTime'
        }).populate({
             path: 'masseuse',  
                select: 'name telephone'
        });

    } else { //if u are admin
        if(req.params.shopId){
            console.log(req.params.shopId);
            query=Reservation.find({shop : req.params.shopId}).populate({
                path: 'shop',
            select: 'name address telephone openTime closeTime'
            }).populate({
                path: 'masseuse',
                select: 'name telephone'
            });
        }else{
            query = Reservation.find().populate({
                path: 'shop',
            select: 'name address telephone openTime closeTime'
            }).populate({                 
                path: 'masseuse',
                select: 'name telephone'
            });
        }
    }

   
    try {
        let reservations = await query;

        reservations = reservations.map(r=>{
    r = r.toObject();

    return {
        masseuse: r.masseuse ? r.masseuse : { name: "ไม่ระบุ" },
        _id: r._id,
        apptDate: r.apptDate,
        user: r.user,
        shop: r.shop,
        createdAt: r.createdAt,
        __v: r.__v
    };
});

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Reservation"
        });
    }
};


exports.getReservation = async(req,res,next)=>{
    try {
    let reservation = await Reservation.findById(req.params.id).populate({
        path: 'shop',
        select: 'name address telephone openTime closeTime'
    }).populate({
        path: 'masseuse',  
        select: 'name'
    });

    if (!reservation) {
        return res.status(404).json({
            success: false,
            message: `No reservation with the id of ${req.params.id}`
        });
    }

     reservation = reservation.toObject();
    if (!reservation.masseuse) {
        reservation.masseuse = { name: "ไม่ระบุ" };
    }


    res.status(200).json({
        success: true,
        data: reservation
    });

} catch (error) {
    console.log(error);
    return res.status(500).json({
        success: false,
        message: "Cannot find Reservation"
    });
}
};


exports.addReservation = async(req,res,next)=>{
    try{
        req.body.shop=req.params.shopId;
        const shop = await Shop.findById(req.params.shopId);

        if(!shop){
            return res.status(404).json({success:false,message : `No MassageShop with the id of ${req.params.shopId}`});
        }
        
        //add userId to req.body
        req.body.user = req.user.id;
        
        //check mhor nuade
        if(req.body.masseuse && req.body.masseuse !== "-"){
            const masseuse = await Masseuse.findById(req.body.masseuse);

            if(!masseuse){
                return res.status(404).json({
                    success:false,
                    message:"No masseuse found"
                });
            }
            if(masseuse.shop.toString() !== req.params.shopId){
                return res.status(400).json({
                    success:false,
                    message:"Masseuse does not belong to this shop"
                });
            }

        }else{
            req.body.masseuse = null;
        }

        //Check reservation
        const existedReservation = await Reservation.find({user:req.user.id});

        //if not admin can create only 3 reservations
        if(existedReservation.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,message:` The user with ID ${req.user.id} has already made 3 reservations`});

        }
        const reservation = await Reservation.create(req.body);

        const populatedReservation = await Reservation.findById(reservation._id)
        .populate({
            path:'shop',
            select:'name'
        })
        .populate({
            path:'masseuse',
            select:'name , telephone'
        });

        res.status(200).json({
            success:true,
            data:populatedReservation
        });
       
        
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot create Reservation"});
    }
};

exports.updateReservation = async (req, res, next) => {
    try {
        let reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }

        //can edit only owner reservation
        if(reservation.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this reservation`});
        }

        if(req.body.masseuse){
    const masseuse = await Masseuse.findById(req.body.masseuse);

    if(!masseuse){
        return res.status(404).json({success:false,message:"No masseuse"});
    }

    if(masseuse.shop.toString() !== reservation.shop.toString()){
        return res.status(400).json({
            success:false,
            message:"Masseuse does not belong to this shop"
        });
    }
}
        reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: reservation
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot update Reservation"
        });
    }
};

exports.deleteReservation = async(req,res,next)=>{
    try{
         const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }
        //only owner can delete his reservation
         if(reservation.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this reservation`});
        }
        await reservation.deleteOne();
        res.status(200).json({
            success: true,
            data: {}
        });
    }catch(error){
         console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot delete Reservation"
        });
    }
}