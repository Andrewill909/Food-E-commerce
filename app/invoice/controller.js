const { subject } = require("@casl/ability");
const Invoice = require("./model");
const { policyFor } = require("../policy/index");
const midtransClient = require("midtrans-client");
const config = require("../config");
const Order = require("../order/model");
const axios = require('axios');


//key
// let serverK = config.midtrans.serverKey+':';
// let based64 = Buffer.from(serverK).toString('base64');
// console.log(based64);

let snap = new midtransClient.Snap({
  isProduction: config.midtrans.isProduction,
  serverKey: config.midtrans.serverKey,
  clientKey: config.midtrans.clientKey,
});

async function show(req, res, next) {
  try {
    let { order_id } = req.params;

    let invoice = await Invoice.findOne({ order: order_id }).populate("order").populate("user");

    //TODO cek policy
    let policy = policyFor(req.user);
    let invoiceSubject = subject("Invoice", { ...invoice, user_id: invoice.user._id });
    if (!policy.can("read", invoiceSubject)) {
      return res.json({
        error: 1,
        message: "Anda tidak memiliki akses untuk melihat invoice ini",
      });
    }

    return res.json(invoice);
  } catch (error) {
    return res.json({
      error: 1,
      message: "Error while getting invoice",
    });
  }
}

async function initiatePayment(req, res) {
  try {

    let { order_id } = req.params;
    //get invoice
    let invoice = await Invoice.findOne({ order: order_id }).populate("user").populate("order");

    if (!invoice) {
      return res.json({
        error: 1,
        message: "Invoice not found",
      });
    }

    //create params for midtrans
    let parameter = {
      "transaction_details": {
        "order_id": invoice.order._id,
        "gross_amount": invoice.total
      },
      "credit_card": {
        "secure": true,
      },
      "customer_details": {
        "first_name": invoice.user.full_name,
        "email": invoice.user.email
      },
    };

    //send invoice info to midtrans
    // let response = await snap.createTransactionToken(parameter);
    let response = await axios({
      url: "https://app.sandbox.midtrans.com/snap/v1/transactions",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Basic " +
          Buffer.from(config.midtrans.serverKey).toString("base64")
      },
      data: parameter
    });
    //send resp to client
    console.log(response.data);
    return res.json(response.data);
  } catch (error) {
    console.log(error);
    return res.json({
      error: 1,
      message: "Something went wrong",
    });
  }
}

async function handleMidtransNotification(req, res) {
  try {
    //send notification data
    let statusResponse = await snap.transaction.notification(req.body);
    //get info from response
    let orderId = statusResponse.order_id;
    let transactionStatus = statusResponse.transaction_status;
    let fraudStatus = statusResponse.fraud_status;

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        //approve trans
        await snap.transaction.approve(orderId);
        //update db to paid and order status to process
        await Invoice.findOneAndUpdate({ order: orderId }, { payment_status: "paid" });
        await Order.findOneAndUpdate({ _id: orderId }, { status: "processing" });
        //success response
        return res.json("success");
      } else if (fraudStatus == "accept") {
        //approve trans
        await snap.transaction.approve(orderId);
        //update db to paid and order status to process
        await Invoice.findOneAndUpdate({ order: orderId }, { payment_status: "paid" });
        await Order.findOneAndUpdate({ _id: orderId }, { status: "processing" });
        //success response
        return res.json("success");
      } else {
        //no changes to database
        return res.json("ok");
      }
    } else if (transactionStatus == "settlement") {
      //this is for non credit card => mean success too
      await Invoice.findOneAndUpdate({ order: orderId }, { payment_status: "paid" }, { new: true });
      await Order.findOneAndUpdate({ _id: orderId }, { status: "delivered" });

      return res.json('success');
    }
  } catch (error) {
      //handle error
      return res.status(500).json('Something went wrong');
  }
}

module.exports = {
  show,
  initiatePayment,
  handleMidtransNotification
};
