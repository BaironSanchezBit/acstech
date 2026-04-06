const mongoose = require('mongoose');
const sitiosWebSchema = require('./sitiosWeb.model');

sitiosWebSchema.statics = {
    create: async function(data) {
        const work = new this(data);
        return await work.save();
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

const sitiosWebModel = mongoose.model('SitioWebs', sitiosWebSchema);
module.exports = sitiosWebModel;