const categoryController = require('./controller');
const multer = require('multer');
const router = require('express').Router();

router.post('/categories', multer().none(), categoryController.store);

module.exports = router;