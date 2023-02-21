var mongoose = require('mongoose');
var Schema = mongoose.Schema;

proSchema = new Schema( {
	
	email: String,
	username: String,
	password: String,
	passwordConf: String,
	categoryid:  {
		type:Schema.Types.ObjectId,
		ref:'Category'
	},
	categoryname: String,
	career: String,
	desc: String,
	image: String
}),
Pro = mongoose.model('Pro', proSchema);

module.exports = Pro;