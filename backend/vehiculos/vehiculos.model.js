const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehiclesSchema = new Schema({
    placa: {
        type: String,
        trim: true,
        required: true,
    },
    marca: {
        type: String,
        trim: true,
        required: true,
    },
    linea: {
        type: String,
        trim: true,
        required: true
    },
    version: {
        type: String,
        trim: true
    },
    modelo: {
        type: String,
        trim: true
    },
    cilindraje: {
        type: String,
        trim: true
    },
    noDocumentoImportacion: {
        type: String,
        trim: true
    },
    fechaImportacion: {
        type: Date,
        trim: true
    },
    color: {
        type: String,
        trim: true
    },
    servicio: {
        type: String,
        trim: true
    },
    clase: {
        type: String,
        trim: true
    },
    carroceria: {
        type: String,
        trim: true
    },
    combustible: {
        type: String,
        trim: true
    },
    pasajeros: {
        type: String,
        trim: true
    },
    numeroMotor: {
        type: String,
        trim: true
    },
    ciudadPlaca: {
        type: String,
        trim: true
    },
    vin: {
        type: String,
        trim: true
    },
    serie: {
        type: String,
        trim: true
    },
    chasis: {
        type: String,
        trim: true
    },
    imagenVehiculo: {
        type: String,
        trim: true
    },
    observaciones: {
        type: String,
        default: ''
    },
    fechaMatricula: {
        type: Date,
        trim: true
    },
    inventarios: {
        type: [String]
    },
    cotizaciones: {
        type: [String]
    },
    tramites: {
        type: [String]
    },
    creditos: {
        type: [String]
    },
    ordenDeTrabajo: {
        type: [String]
    }
}, {
    timestamps: true
});

module.exports = vehiclesSchema;