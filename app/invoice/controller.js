const {subject} = require('@casl/ability');
const Invoice = require('./model');
const {policyFor} = require('../policy/index');

async function show(req, res, next){
    try {
        
        let {order_id} = req.params;

        let invoice = await Invoice.findOne({order: order_id}).populate('order').populate('user');

        //TODO cek policy
        let policy = policyFor(req.user);
        let invoiceSubject = subject('Invoice', {...invoice, user_id: invoice.user._id});
        if(!policy.can('read', invoiceSubject)){
            return res.json({
                error: 1,
                message: 'Anda tidak memiliki akses untuk melihat invoice ini'
            })
        }

        return res.json(invoice);
    } catch (error) {
        
        return res.json({
            error:1,
            message: 'Error while getting invoice'
        })
    }
}

module.exports = {
    show
}