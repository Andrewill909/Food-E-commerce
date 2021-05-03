//import package mongoose
const mongoose = require('mongoose')

//import konfigurasi dari app/config.js
const {dbHost, dbUser, dbPort, dbPass, dbName} = require('../app/config')

//koneksi ke mongoose
mongoose.connect(`mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=admin`,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

const db = mongoose.connection

//export db
module.exports = db