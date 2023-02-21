var mongoose = require('mongoose');
var Schema = mongoose.Schema;

bookSchema = new Schema({
        proid:  {
            type:Schema.Types.ObjectId,
            ref:'Pro'
        },
        categoryname: String,
        category: String,
        status: String,
        date: String,
        time: String,
        ratingdesc: String,
        rating: {
            type:Number,
            default: 5
        },
        userid:  {
            type:Schema.Types.ObjectId,
            ref:'User'
        },
    }),
    Book = mongoose.model('Book', bookSchema);

module.exports = Book;