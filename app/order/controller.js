const mongoose = require('mongoose')
const Order = require('./model');
const OrderItem = require('../order-item/model');
const CartItem = require('../cart-item/model');
const DeliveryAddress = require('../delivery-address/model');
const {policyFor} = require('../policy/index');
const {subject} = require('@casl/ability');

async function store(req, res, next){

    //TODO cek policy
    const policy = policyFor(req.user);

    if(!policy.can('create', 'Order')){
        return res.json({
            error:1,
            message: 'You are not allowed to perform this action'
        })
    }

    try {
        //cari item pada cart
        let {delivery_fee, delivery_address} = req.body;

        let items = await CartItem.find({user: req.user._id}).populate('product');

        if(!items.length){
            return res.json({
                error:1,
                message: 'No items in the cart - cannot create order'
            })
        }

        //cari delivery address
        let address = await DeliveryAddress.findOne({_id: delivery_address});

        //setelah itu bisa buat order baru
        let order = new Order({
            _id: new mongoose.Types.ObjectId(),
            status: 'waiting_payment',
            delivery_fee,
            delivery_address:{
                provinsi: address.provinsi,
                kabupaten: address.kabupaten,
                kecamatan: address.kecamatan,
                kelurahan: address.kelurahan,
                detail: address.detail
            },
            user: req.user._id
        })
        //! _id pada order secara eksplisit karena akan direlasikan dgn OrderItem
        //dari items (CartItem) kemudian di insert ke OrderItem

        let orderItems = await OrderItem.insertMany(
            items.map(item => {
                return {
                    ...item,
                    name: item.product.name,
                    qty: parseInt(item.qty),
                    price: parseInt(item.poduct.price),
                    order: order._id,
                    product: item.product._id
                }
            })
        )

        //insert orderItems ke order dengan melakukan push documents
        orderItems.forEach(item => order.order_items.push(item));

        await order.save();

        //hapus cartitem
        await CartItem.deleteMany({user: req.user._id});

        return res.json(order);

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

    let policy = policyFor(req,use);

    if(!policy.can('view', 'Order')){
        return res.json({
            error:1,
            message: 'You are not allowed to perform this action'
        })
    }

    try {
        
        let {limit = 10, skip = 0} = req.query;

        //hitung semua order
        let count = await Order.find({user: req.user._id}).countDocuments();

        //mendapatkan order dengan limit dan skip (di sort secara ascending)
        let orders = await Order.find({user: req.user._id}).limit(parseInt(limit)).skip(parseInt(skip)).sort('-createdAt');

        //perlu ditambahkan {virtuals: true} pada toJSON agar field virtual dianggap
        return res.json({
            data: orders.map(order => order.toJSON({virtuals: true})),
            count
        })
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
    store, index
}