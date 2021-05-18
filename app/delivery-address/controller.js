const DeliveryAddress = require('./model');
const {policyFor} = require('../policy/index');

const {subject} = require('@casl/ability');

async function store(req, res, next){

    //TODO cek policy
    let policy = policyFor(req.user);

    if(!policy.can('create', 'DeliveryAddress')){
        return res.json({
            error:1,
            message:'You are not allowed to perform this action'
        })
    }

    try {
        
        let payload = req.body;
        let user = req.user;

        let address = new DeliveryAddress({...payload, user: user._id});

        await address.save();

        return res.json(address);

    } catch (error) {
        
        if(error && error.name === 'ValidationError'){
            return res.json({
                error:1,
                message: error.message,
                fields: error.errors
            })
        }

        next(error);
    }

}

async function update(req, res, next){

    let policy = policyFor(req.user);

    try {
        
        let{id} = req.params;

        //! buat payload dan keluarkan _id
        let {_id, ...payload} = req.body;

        //TODO cek policy
        //TODO berbeda karena membandingkan object -> menggunakan subject
        let address = await DeliveryAddress.findOne({_id: id});
        let subjectAddress = subject('DeliveryAddress', {...address, user_id: address.user});

        if(!policy.can('update', subjectAddress)){
            return res.json({
                error:1,
                message: 'You are not allowed to modify this resource'
            })
        }

        //update
        address = await DeliveryAddress.findOneAndUpdate({_id: id}, payload, {new: true});

        return res.json(address);

    } catch (error) {
    
        if(error && error.name === 'ValidationError') {
            return res.json({
                error:1,
                message: error.message,
                fields: error.errors
            })
        }

        next(error);
    }
}

async function destroy(req, res, next){

    let policy = policyFor(req.user);

    try {
        
        let {id} = req.params;

        //TODO cek policy
        let address = await DeliveryAddress.findOne({_id: id});
        let subjectAddress = subject('DeliveryAddress', {...address, user_id: address.user});

        if(!policy.can('delete', subjectAddress)){
            return res.json({
                error:1,
                message: 'You are not allowed to delete this resource'
            })
        }

        address = await DeliveryAddress.findOneAndDelete({_id: id});

        return res.json(address);

    } catch (error) {
        
        if(error && error.name === 'ValidationError'){
            return res.json({
                error:1,
                message: error.message,
                fields: error.errors
            })
        }

        next(error);
    }
}

async function index(req, res, next){

    let policy = policyFor(req.user);

    if(!policy.can('view', 'DeliveryAddress')){
        return res.json({
            error:1,
            message:'You are not allowed to perform this action'
        })
    }

    try {
        let {limit = 10, skip = 0} = req.query;

        const count = await DeliveryAddress.find({user: req.user._id}).countDocuments();

        const deliveryAddresses = await DeliveryAddress.find({user: req.user._id}).limit(parseInt(limit)).skip(parseInt(skip)).sort('-createdAt');

        return res.json({data: deliveryAddresses, count});
    } catch (error) {
        
        if(error && error.name === 'ValidationError'){
            return res.json({
                error:1,
                message: error.message,
                fields: error.errors
            })
        }

        next(error);
    }
}

module.exports = {
    store, update, destroy, index
}
