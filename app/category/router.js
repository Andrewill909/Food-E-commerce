const categoryController = require('./controller');
const multer = require('multer');
const router = require('express').Router();

router.post('/categories', multer().none(), categoryController.store);

router.put('/categories/:id', multer().none(), categoryController.update);

router.delete('/categories/:id', multer().none(), categoryController.destroy);

module.exports = router;