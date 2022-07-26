const mongoose = require('mongoose');

const prodCollection = 'mensajes';

const prodSchema = new mongoose.Schema({
    author: {
        mail: {type: String, required: true},
        nombre: { type: String, required: true},
        apellido: { type: String, required: true},
        edad: { type: Number, required: true},
        alias: { type: String, required: true},
        avatar: { type: String, required: true},
    },
    text : {type: String, required: true},
    fecha: { type: String, required: true},
    hora: {type: String, required:true}
})

const productos = mongoose.model(prodCollection, prodSchema);

module.exports = productos;