const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const worksSchema = new Schema({
    banco: {
        type: String,
        require: true
    },
    disponible: {
        type: Number,
        require: true
    },
}, {
    timestamps: true
});

module.exports = worksSchema;