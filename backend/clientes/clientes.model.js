const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const worksSchema = new Schema({
    primerNombre: {
        type: String,
        trim: true,
    },
    segundoNombre: {
        type: String,
        trim: true,
    },
    primerApellido: {
        type: String,
        trim: true
    },
    segundoApellido: {
        type: String,
        trim: true
    },
    tipoIdentificacion: {
        type: String,
        trim: true
    },
    numeroIdentificacion: {
        type: String,
        trim: true
    },
    digitoVerificacion: {
        type: String,
        trim: true
    },
    ciudadIdentificacion: {
        type: String,
        trim: true
    },
    direccionResidencia: {
        type: String,
        trim: true
    },
    ciudadResidencia: {
        type: String,
        trim: true
    },
    celularOne: {
        type: String,
        trim: true
    },
    celularTwo: {
        type: String,
        trim: true
    },
    correoElectronico: {
        type: String,
        trim: true
    },
    fechaIngreso: {
        type: Date,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = worksSchema;