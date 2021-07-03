const router = require('express').Router();
const invoiceController = require('./controller');

router.get('/invoices/:order_id', invoiceController.show);

router.get('/invoices/:order_id/initiate_payment', invoiceController.initiatePayment);

router.post('/invoices/handleMidtransNotification', invoiceController.handleMidtransNotification);

module.exports = router;