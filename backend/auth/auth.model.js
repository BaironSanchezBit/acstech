const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    googleId: {
        type: String,
        required: false,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    cargo: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: [String],
        required: false,
        trim: true
    },
    image: {
        type: String,
        required: false
    },
    googleAuthenticatorSecret: {
        type: String,
        required: false
    },
    googleAccessToken: {
        type: String,
        required: false
    },
    googleRefreshToken: {
        type: String,
        required: false
    },
    verificationCode: { type: String,
        required: false },
    verificationCodeExpires: { type: Date,
        required: false }
}, {
    timestamps: true
});

module.exports = userSchema;