const mongoose = require('mongoose');
require('dotenv').config({ path: 'config.env' });

const conectarDB = async() => {
    try {
        await mongoose.connect(process.env.DB_MONGO)
        console.log('BD Connected');
    } catch (error) {
        console.log(error);
        process.exit(1); // Usar 1 para indicar un error
    }
}

module.exports = conectarDB;