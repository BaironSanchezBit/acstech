const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const worksSchema = new Schema({
    nombre: {
        type: String,
        trim: true,
    },
    valor: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true
});

module.exports = worksSchema;