const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const worksSchema = new Schema({
    website: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = worksSchema;