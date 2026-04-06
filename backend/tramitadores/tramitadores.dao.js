    const mongoose = require('mongoose');
    const tramitadoresSchema = require('./tramitadores.model');

    tramitadoresSchema.statics = {
        create: async function(data) {
            const tramitadores = new this(data);
            return await tramitadores.save();
        },

        getAll: async function() {
            return await this.find({});
        },

        getOne: async function(id) {
            return await this.findById(id);
        },

        updateRegister: async function(id, updateData) {
            return await this.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
        },
    };

    const tramitadoresModel = mongoose.model('tramitadores', tramitadoresSchema);
    module.exports = tramitadoresModel;