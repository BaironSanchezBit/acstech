const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bancosSchema = new Schema({
    nombreBanco: {
        type: String,
        required: false
    },
    nombreAsesorBancario: {
        type: String,
        required: false
    },
    telefonoAsesorBancario: {
        type: String,
        required: false
    },
    correoAsesorBancario: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = bancosSchema;