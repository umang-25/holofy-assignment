const { Schema, model } = require('mongoose');

const bookSchema = new Schema({
    uuid: {
        type: String,
        required: true
    },
    name: {
        type: String,
    },
    releaseDate: {
        type: Number,
    },
    authorName: {
        type: String
    }
})

const Books = model('Books', bookSchema);

module.exports = { Books }
