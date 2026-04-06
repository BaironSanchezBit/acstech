const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const suppliersSchema = new Schema({
    tercero: {
        type: String
    },
    nombreComercial: {
        type: String
    },
    servicio: {
        type: String
    },
    direccion: {
        type: String
    },
    telefono: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = suppliersSchema;