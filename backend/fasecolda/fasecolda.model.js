const mongoose = require('mongoose');

const fasecoldaSchema = new mongoose.Schema({
    modelo: String,
    marca: String,
    referencia: String,
    linea: String,
    version: String,
    ref3: String,
    imagen_url: String,
    cilindraje: String,
    transmision: String,
    pasajeros: String,
    peso: String,
    combustible: String,
    potencia: String,
    traccion: String,
    puertas: String
}, { collection: 'fasecolda' });

module.exports = mongoose.model('Fasecolda', fasecoldaSchema);
