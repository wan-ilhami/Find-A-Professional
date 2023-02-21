var mongoose = require('mongoose');
var Schema = mongoose.Schema;

categorySchema = new Schema( {
    name: String,
	image: String
}),
Category = mongoose.model('Category', categorySchema);

module.exports = Category;