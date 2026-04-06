const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const comisionesSchema = new Schema({
    min: {
        type: String
    },
    max: {
        type: String
    },
    valor: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = comisionesSchema;