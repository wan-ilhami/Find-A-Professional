var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Category = require('../models/category');
var Pro = require('../models/professional');
let alert = require('alert');
var Book = require('../models/book');
var nodemailer = require('nodemailer');

var Message = require("../models/chat");

var transport = nodemailer.createTransport({
	host: "smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: "4fe75114b6aca8",
		pass: "4ae71608c6a8ab"
	}
});

// Upload Imges
const crypto = require('crypto');
const path = require('path')
const multer = require("multer");
const {
	Console
} = require('console');
uploadPath = path.resolve(__dirname, "../asset/img/pic");

const storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, uploadPath)
	},
	filename: function (req, file, callback) {
		// RandomBytes function will generate a random name
		let customFileName = crypto.randomBytes(18).toString('hex')
		// get file extension from original file name
		let fileExtension = path.extname(file.originalname).split('.')[1];
		callback(null, customFileName + '.' + fileExtension)
	}
})
const upload = multer({
	storage: storage
});


// Router get all the file to view-------------------------------------------------------------------------------------------------------------------
router.get('/', function (req, res, next) {
	return res.render('index.ejs');
});



router.get('/login', function (req, res, next) { //login
	return res.render('login.ejs');
});

router.get('/register', function (req, res, next) {
	return res.render('register.ejs');
});

router.get('/admindashboard', function (req, res, next) {
	User.find({}, (err, data1) => {
        Book.find({}, (err, data2) => {
			Pro.find({}, (err, data3) => {
				Book.find({ status : "accept"}, (err, data4) => {
					Book.find({ status : "complete"}, (err, data5) => {
						Book.find({ status : "reject"}, (err, data6) => {
							if(data1 || data2 || data3 || data4|| data5 || data6){
								var userCount = data1.length;
								var bookCount = data2.length;
								var proCount = data3.length;
								var acceptCount = data4.length;
								var completeCount = data5.length;
								var rejectCount = data6.length;
							
								res.render("admin/admindashboard", {userCount, bookCount, proCount, acceptCount, completeCount,rejectCount});
							}
						
						})
					})
				})
				
			})
        })
    })
});




router.get('/userdashboard', function (req, res, next) { //shortform

	Category.find((err, docs) => {
		if (!err) {
			console.log(docs);
			res.render("user/userdashboard.ejs", {
				data: docs
			});
		} else {
			console.log('Failed to retrieve the booking List: ' + err);
		}
	});


	// return res.render('user/userdashboard.ejs');
});

router.get('/profile', function (req, res, next) { //shortform
	User.findOne({
		_id: req.session.userId
	}, function (err, data) {
		if (!data) {
			res.redirect('/');
		} else {
			//console.log("found");
			return res.render('user/userprofile.ejs', {
				"name": data.username,
				"email": data.email,
				"password": data.password,
				"passwordConf": data.passwordConf,
				"image": data.image,
				"_id": data._id
			});
		}
	});
});



router.get('/edituserprofile', function (req, res, next) { //shortform
	User.findOne({
		_id: req.session.userId
	}, function (err, data) {
		console.log("data");
		console.log(data);
		if (!data) {
			res.redirect('/');
		} else {
			//console.log("found");
			return res.render('user/edituserprofile.ejs', {
				"name": data.username,
				"email": data.email,
				"password": data.password,
				"passwordConf": data.passwordConf,
				"image": data.image,
				"_id": data._id
			});
		}
	});
});

router.get('/viewprofessional/:name', function (req, res, next) { //shortform

	Category.findOne({
		name: req.params.name
	}, function (err, data1) {

		if (!data1) {
			res.redirect('/');
		} else {
			Pro.find({
				categoryname: req.params.name
			}, function (err, data) {
				return res.render('user/viewprofessional.ejs', {
					"data": data,
					"categories": data1
				});
			});

		}
	});

});


router.get('/professionaldetail/:id', function (req, res, next) { //shortform
	Pro.findOne({
		_id: req.params.id
	}, function (err, docs) {
		
		if (!docs) {
			res.redirect('/');
		} else {
			Book.find({
				proid : req.params.id
			}).populate('proid').populate('userid').exec(function (err, docs1) {
				if (docs1) {
					res.render("user/professionaldetail.ejs", {
						pro : docs,
						book : docs1

					})
				} else {
					res.render("user/professionaldetail.ejs");
				}
			});
		}
	});
	

});


router.get('/historybook', function (req, res, next) { //shortform
	console.log(req.session.userId)
	Book.find({
		userid: req.session.userId
	}).populate('proid').exec(function (err, data) {
		if (data) {
			var bookings = data
			//console.log(bookings);
			res.render("user/historybook.ejs", {
				bookings
			})
		} else {
			res.render("user/historybook.ejs");
		}
	});
});

router.get('/prodashboard', function (req, res, next) {

	Book.find({
		proid: req.session.userId,
		status: "pending"
	}).populate('proid').populate('userid').exec(function (err, data) {
		if (data) {
			var bookings = data
			console.log(bookings);
			res.render("professional/prodashboard.ejs", {
				bookings
			})
		} else {
			res.render("professional/prodashboard.ejs");
		}
	});


});

// -------------------------------------------------------------------------

// router.get('/adminviewuser', function (req, res, next) { //shortform
// 	return res.render('admin/adminviewuser.ejs');
// });
router.get('/adminacategories', function (req, res, next) { //shortform

	Category.find((err, docs) => {
		if (!err) {
			res.render("admin/adminacategories.ejs", {
				data: docs
			});
		} else {
			console.log('Failed to retrieve the category List: ' + err);
		}
	});


});

router.get('/adminbooking', function (req, res, next) { //shortform
	// console.log(req.session.userId)
	Book.find({}).populate('proid').populate('userid').exec(function (err, data) {
		if (data) {
			var bookings = data
			console.log(bookings);
			res.render("admin/adminbooking.ejs", {
				bookings
			})
		} else {
			res.render("admin/adminbooking.ejs");
		}
	});
});
router.get('/pregister', function (req, res, next) {
	return res.render('pregister.ejs');
});

router.post('/pregister', function (req, res, next) { //registration
	console.log(req.body);
	var personInfo = req.body;
	if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {
			Pro.findOne({
				email: personInfo.email
			}, (err, result) => {
				if (!result) {
					var newPerson = new Pro({
						email: personInfo.email,
						role: "professional",
						username: personInfo.username,
						password: personInfo.password,
						passwordConf: personInfo.passwordConf
					});

					newPerson.save(function (err, Person) {
						if (err)
							res.json({
								status: "x ok"
							})
						else
							//res.json({status: "ok"})
							res.redirect('/login');
					});

				}

			})

		} else {
			res.send({
				"Success1": "password is not matched"
			});
		}

	}
});




router.post('/register', function (req, res, next) { //registration
	console.log(req.body);
	var personInfo = req.body;
	if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {
			User.findOne({
				email: personInfo.email
			}, (err, result) => {
				if (!result) {
					var newPerson = new User({
						email: personInfo.email,
						role: "user",
						username: personInfo.username,
						password: personInfo.password,
						passwordConf: personInfo.passwordConf
					});

					newPerson.save(function (err, Person) {
						if (err)
							res.json({
								status: "x ok"
							})
						else
							//res.json({status: "ok"})
							res.redirect('/login');
					});

				}

			})

		} else {
			res.send({
				"Success1": "password is not matched"
			});
		}

	}
});

router.get('/logout', function (req, res, next) { //logout
	console.log("logout")
	if (req.session) {
		// delete session object
		req.session.destroy(function (err) {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});


const admin = {
	email: "admin@gmail.com",
	password: "admin"
}

router.post('/login', (req, res) => {

	if (req.body.email == admin.email && req.body.password == admin.password) {
		req.session.user = req.body.email;
		res.redirect('/admindashboard');
	} else {
		User.findOne({
			email: req.body.email
		}, function (err, data) {
			if (data) {
				if (data.email == req.body.email && data.password == req.body.password) {
					req.session.userId = data._id;
					res.redirect('/userdashboard');
				} else {
					console.log(err);
					alert("Email and Password does not matched");
					res.redirect('/login');
				}
			} else {
				alert("Email and Password does not matched");
			}

		})
	};
});

router.post('/plogin', (req, res) => {
	if (req.body.email == admin.email && req.body.password == admin.password) {
		req.session.user = req.body.email;
		res.redirect('/admindashboard');
	} else {
		Pro.findOne({
			email: req.body.email
		}, function (err, data) {
			if (data) {
				if (data.email == req.body.email && data.password == req.body.password) {
					req.session.userId = data._id;
					res.redirect('/prodashboard');
				} else {
					alert("Email and Password does not matched");
					res.redirect('/plogin');
				}
			} else {
				alert("There are no data in databased");
			}

		})
	};

});




router.get('/adminviewuser', function (req, res, next) { //forget password
	User.find({},(err, docs) => {
		if (!err) {
			res.render("admin/adminviewuser.ejs", {
				data: docs
			});
		} else {
			console.log('Failed to retrieve the user List: ' + err);
		}
	});
});



router.post('/updprofile', upload.array("file"), (req, res) => {
	// Create Mongose Method to Update a Existing Record Into Collection
	var personInfo = req.body;

	if (personInfo.Epassword == personInfo.EpasswordConf) {
		var data = {
			username: req.body.Ename,
			email: req.body.Eemail,
			password: req.body.Epassword,
			passwordConf: req.body.EpasswordConf,
			image: '/pic/' + req.files[0].filename
		}
		User.findByIdAndUpdate({
			_id: req.session.userId
		}, data, function (err, docs) {
			if (err) throw err
			else {
				console.log(docs);
				res.redirect('/profile');
			}

		});

	} else {
		res.send({
			"Enter Again": "cant update",
		}, res.redirect('/profile'));

	}

});

router.get('/adminaddcategory', function (req, res, next) { //shortform
	return res.render('admin/adminaddcategory.ejs');
});

// addcategory
router.post('/adminaddcategory', upload.array("file"), (req, res) => {

	var category = new Category({
		name: req.body.name,
		image: '/pic/' + req.files[0].filename

	})
	console.log(req.files);

	category.save((err, docs) => {
		if (!err) {

			res.redirect('/adminacategories');
		} else {
			res.redirect('/adminacategories');
		}
	});
});

router.get('/plogin', function (req, res, next) { //shortform
	return res.render('plogin.ejs');
});



router.get('/proprofile', function (req, res, next) { //shortform
	Pro.findOne({
		_id: req.session.userId
	}, function (err, data) {
		console.log("data");
		console.log(data);
		if (!data) {
			res.redirect('/');
		} else {
			//console.log("found");
			Category.find({}, function (err, data1) {
				return res.render('professional/proprofile.ejs', {
					"pro": data,
					"categories": data1
				});

			})

		}
	});
});
router.get('/editproprofile', function (req, res, next) { //shortform
	Pro.findOne({
		_id: req.session.userId
	}, function (err, data) {
		console.log("data");
		console.log(data);
		if (!data) {
			res.redirect('/');
		} else {
			//console.log("found");
			return res.render('professional/editproprofile.ejs', {
				"name": data.username,
				"email": data.email,
				"password": data.password,
				"passwordConf": data.passwordConf,
				"image": data.image,
				"_id": data._id
			});
		}
	});
});

router.post('/proupdprofile', upload.array("file"), (req, res) => {
	// Create Mongose Method to Update a Existing Record Into Collection
	var personInfo = req.body;

	if (personInfo.Epassword == personInfo.EpasswordConf) {
		var data = {
			username: req.body.Ename,
			email: req.body.Eemail,
			password: req.body.Epassword,
			passwordConf: req.body.EpasswordConf,
			image: '/pic/' + req.files[0].filename
		}
		Pro.findByIdAndUpdate({
			_id: req.session.userId
		}, data, function (err, docs) {
			if (err) throw err
			else {
				console.log(docs);
				res.redirect('/proprofile');
			}

		});

	} else {
		res.send({
			"Enter Again": "cant update",
		}, res.redirect('/proprofile'));

	}

});
router.post('/carrierupd', (req, res) => {
	// Create Mongose Method to Update a Existing Record Into Collection


	var data = {
		categoryname: req.body.Catergory,
		career: req.body.career,
		desc: req.body.dis
	}

	console.log(data);

	Pro.findByIdAndUpdate({
		_id: req.session.userId
	}, data, function (err, docs) {
		if (err) throw err
		else {
			console.log(docs);
			res.redirect('/proprofile');
		}
	});
});



router.get('/editcarrier', function (req, res, next) { //shortform
	Pro.findOne({
		_id: req.session.userId
	}, function (err, data) {
		console.log("data");
		console.log(data);
		if (!data) {
			res.redirect('/');
		} else {
			//console.log("found");
			Category.find({}, function (err, data1) {
				return res.render('professional/editcarrier.ejs', {
					"pro": data,
					"categories": data1
				});

			})

		}
	});
});

router.get('/prohistory', function (req, res, next) {
	Book.find({
		proid: req.session.userId,
	}).populate('proid').populate('userid').exec(function (err, data) {
		if (data) {
			var bookings = data
			console.log(bookings);
			res.render("professional/prohist.ejs", {
				bookings
			})
		} else {
			res.render("professional/prohist.ejs");
		}
	});
});

router.get('/bookuser/:id', function (req, res, next) {
	Pro.findOne({
		_id: req.params.id
	}, function (err, data) {
		console.log("data");
		if (!data) {
			res.redirect('/');
		} else {
			//console.log("found");
			return res.render('user/userbook.ejs', {
				"pro": data
			});
		}
	});
});
router.get('/api/getAvailableTime/:date', (req, res) => {
	if (req.params.date != "" && req.params.date != "") {
		Book.find({
			date: req.params.date,
		}, (err, data) => {
			if (err) {
				res.status(400).json("Not Found")
			} else {
				res.json(data)
			}
		})
	} else {
		res.status(400).json("Not Found")
	}

})

router.post('/book', (req, res) => {
	console.log(req.session.userId);
	User.findOne({
		_id: req.session.userId
	}, function (err, data) {

		if (!data) {
			res.redirect('/');
		} else {
			var book = new Book({
				proid: req.body.id,
				categoryname: req.body.categoryname,
				date: req.body.date,
				time: req.body.time,
				status: req.body.status,
				userid: req.session.userId
			});

			book.save(function (err, docs) {
				if (err) throw err
				else {
					console.log(docs);
					res.redirect('/userdashboard');
				}
			});

			message = {
				from: "admin@gmail.com",
				to: data.email,
				subject: "Consultation Find A Professional",
				text: data.email + " " + data.username,
				html: `<div class="receipt-content">
				<div class="container bootstrap snippets bootdey">
				  <div class="row">
					<div class="col-md-12">
					  <div class="invoice-wrapper">
						<div class="intro">
						  Hi <strong>${data.username}</strong>,
						  <br>
						  This is the booking for your session.
						  <p>
						  Below is your booking details:
						  <p>
						  Your Court:
						  ${req.body.date}
						  <br>
						  Date Booking:
						  ${req.body.date}
						  <br>
						  Time Booking:
						  ${req.body.time}
						  
						</div>
			  
					   
			  
						<div class="payment-details">
						  <div class="row">
							<div class="col-sm-6">
							  <span>Customer</span>
							  <strong>
							  <br>
								${data.username + ','}
							  </strong>
							  <p>
		
								  Your email: ${data.email} <br>
								  
							  </p>
							</div>
						  </div>
						</div>
					  </div>
					</div>
				  </div>
				</div>
			  </div> 
			  <style>.receipt-content .logo a:hover {
				text-decoration: none;
				color: #7793C4; 
			  }
			  
			  .receipt-content .invoice-wrapper {
				background: #FFF;
				border: 1px solid #CDD3E2;
				box-shadow: 0px 0px 1px #CCC;
				padding: 40px 40px 60px;
				margin-top: 40px;
				border-radius: 4px; 
			  }
			  
			  .receipt-content .invoice-wrapper .payment-details span {
				color: #A9B0BB;
				display: block; 
			  }
			  .receipt-content .invoice-wrapper .payment-details a {
				display: inline-block;
				margin-top: 5px; 
			  }
			  
			  .receipt-content .invoice-wrapper .line-items .print a {
				display: inline-block;
				border: 1px solid #9CB5D6;
				padding: 13px 13px;
				border-radius: 5px;
				color: #708DC0;
				font-size: 13px;
				-webkit-transition: all 0.2s linear;
				-moz-transition: all 0.2s linear;
				-ms-transition: all 0.2s linear;
				-o-transition: all 0.2s linear;
				transition: all 0.2s linear; 
			  }
			  
			  .receipt-content .invoice-wrapper .line-items .print a:hover {
				text-decoration: none;
				border-color: #333;
				color: #333; 
			  }
			  
			  .receipt-content {
				background: #ECEEF4; 
			  }
			  @media (min-width: 1200px) {
				.receipt-content .container {width: 900px; } 
			  }
			  
			  .receipt-content .logo {
				text-align: center;
				margin-top: 50px; 
			  }
			  
			  .receipt-content .logo a {
				font-family: Myriad Pro, Lato, Helvetica Neue, Arial;
				font-size: 36px;
				letter-spacing: .1px;
				color: #555;
				font-weight: 300;
				-webkit-transition: all 0.2s linear;
				-moz-transition: all 0.2s linear;
				-ms-transition: all 0.2s linear;
				-o-transition: all 0.2s linear;
				transition: all 0.2s linear; 
			  }
			  
			  .receipt-content .invoice-wrapper .intro {
				line-height: 25px;
				color: #444; 
			  }
			  
			  .receipt-content .invoice-wrapper .payment-info {
				margin-top: 25px;
				padding-top: 15px; 
			  }
			  
			  .receipt-content .invoice-wrapper .payment-info span {
				color: #A9B0BB; 
			  }
			  
			  .receipt-content .invoice-wrapper .payment-info strong {
				display: block;
				color: #444;
				margin-top: 3px; 
			  }
			  
			  @media (max-width: 767px) {
				.receipt-content .invoice-wrapper .payment-info .text-right {
				text-align: left;
				margin-top: 20px; } 
			  }
			  .receipt-content .invoice-wrapper .payment-details {
				border-top: 2px solid #EBECEE;
				margin-top: 30px;
				padding-top: 20px;
				line-height: 22px; 
			  }
			  
			  
			  @media (max-width: 767px) {
				.receipt-content .invoice-wrapper .payment-details .text-right {
				text-align: left;
				margin-top: 20px; } 
			  }
			  .receipt-content .invoice-wrapper .line-items {
				margin-top: 40px; 
			  }
			  .receipt-content .invoice-wrapper .line-items .headers {
				color: #A9B0BB;
				font-size: 13px;
				letter-spacing: .3px;
				border-bottom: 2px solid #EBECEE;
				padding-bottom: 4px; 
			  }
			  .receipt-content .invoice-wrapper .line-items .items {
				margin-top: 8px;
				border-bottom: 2px solid #EBECEE;
				padding-bottom: 8px; 
			  }
			  .receipt-content .invoice-wrapper .line-items .items .item {
				padding: 10px 0;
				color: #696969;
				font-size: 15px; 
			  }
			  @media (max-width: 767px) {
				.receipt-content .invoice-wrapper .line-items .items .item {
				font-size: 13px; } 
			  }
			  .receipt-content .invoice-wrapper .line-items .items .item .amount {
				letter-spacing: 0.1px;
				color: #84868A;
				font-size: 16px;
			   }
			  @media (max-width: 767px) {
				.receipt-content .invoice-wrapper .line-items .items .item .amount {
				font-size: 13px; } 
			  }
			  
			  .receipt-content .invoice-wrapper .line-items .total {
				margin-top: 30px; 
			  }
			  
			  .receipt-content .invoice-wrapper .line-items .total .extra-notes {
				float: left;
				width: 40%;
				text-align: left;
				font-size: 13px;
				color: #7A7A7A;
				line-height: 20px; 
			  }
			  
			  @media (max-width: 767px) {
				.receipt-content .invoice-wrapper .line-items .total .extra-notes {
				width: 100%;
				margin-bottom: 30px;
				float: none; } 
			  }
			  
			  .receipt-content .invoice-wrapper .line-items .total .extra-notes strong {
				display: block;
				margin-bottom: 5px;
				color: #454545; 
			  }
			  
			  .receipt-content .invoice-wrapper .line-items .total .field {
				margin-bottom: 7px;
				font-size: 14px;
				color: #555; 
			  }
			  
			  .receipt-content .invoice-wrapper .line-items .total .field.grand-total {
				margin-top: 10px;
				font-size: 16px;
				font-weight: 500; 
			  }
			  
			  .receipt-content .invoice-wrapper .line-items .total .field.grand-total span {
				color: #20A720;
				font-size: 16px; 
			  }
			  
			  .receipt-content .invoice-wrapper .line-items .total .field span {
				display: inline-block;
				margin-left: 20px;
				min-width: 85px;
				color: #84868A;
				font-size: 15px; 
			  }
			  
			  .receipt-content .invoice-wrapper .line-items .print {
				margin-top: 50px;
				text-align: center; 
			  }
			  
			  
			  
			  .receipt-content .invoice-wrapper .line-items .print a i {
				margin-right: 3px;
				font-size: 14px; 
			  }
			  
			  .receipt-content .footer {
				margin-top: 40px;
				margin-bottom: 110px;
				text-align: center;
				font-size: 12px;
				color: #969CAD; 
			  }                    </style>`

			};
			transport.sendMail(message, function (err, info) {
				if (err) {
					console.log(err);
				} else {
					console.log(info);
				}
			});

		}
	});

});


router.get('/acceptbooking/:id', async function (req, res, next) {
	console.log(req.params.id);

	await Book.findByIdAndUpdate(req.params.id, {
		status: "accept"
	})

	return res.render("professional/acceptbooking.ejs", res.redirect('/prodashboard'));
});

router.get('/rejectbooking/:id', async function (req, res, next) {
	console.log(req.params.id);


	await Book.findByIdAndUpdate(req.params.id, {
		status: "reject"
	})

	return res.render("professional/acceptbooking.ejs",
		res.redirect('/prodashboard'));
});

router.get('/rating/:id', async function (req, res, next) {

	await Book.findByIdAndUpdate(req.params.id, {
		status: "complete"
	})

	Book.findById(
		req.params.id
	).populate('proid').exec(function (err, data) {
		if (data) {
			var bookings = data
			console.log(bookings);
			res.render("user/rating.ejs", {
				bookings
			})
		} else {
			res.render("user/rating.ejs");
		}
	});

});


router.get('/bookinprogress', async function (req, res, next) {

	Book.find({
		userid: req.session.userId,
		status: "accept"
	}).populate('proid').exec(function (err, data) {
		if (data) {
			var bookings = data
			console.log(bookings);
			res.render("user/bookinginprogress.ejs", {
				bookings
			})
		} else {
			res.render("user/bookinginprogress.ejs");
		}
	});


});

router.get('/progress', async function (req, res, next) {

	Book.find({
		proid: req.session.userId,
		status: "accept"
	}).populate('userid').exec(function (err, data) {
		if (data) {
			var bookings = data
			console.log(bookings);
			res.render("professional/bookinprogress.ejs", {
				bookings
			})
		} else {
			res.render("professional/bookinginprogress.ejs");
		}
	});


});

router.post('/rate', async function (req, res, next) {

	console.log(req.body.rate);
	console.log(req.body.id);

	await Book.findByIdAndUpdate(req.body.id, {
		rating: req.body.rate,
		ratingdesc: req.body.ratedesc
	})

	res.redirect("/historybook");

});
// user chat---------------------------------------------------------------------------------
var http = require('http').Server(router);
var io = require('socket.io')(http);

// Render Message
router.get('/messages/:id', async function (req, res, next) {
	user = await User.findOne({_id: req.session.userId},  {username: 1})
	return res.render("user/messages.ejs", {user: user, booking: req.params.id});
});


// Display Message from DB
router.get('/messageslist/:booking', (req, res) => {
	Message.find({booking: req.params.booking})
	.populate({
		path: "pro",
		model: Pro,
		select: {'password':0, 'passwordConf':0}
	}).populate({
		path: "user",
		model: User,
		select: {'password':0, 'passwordConf':0}
	}).exec().then((data) => {
		res.json(data)
	})
	
})

// Display Latest One Message from DB
router.get('/lastmessage/:booking', (req, res) => {
	Message.find({booking: req.params.booking}).sort({$natural: -1 }).limit(1)
	.populate({
		path: "pro",
		model: Pro,
		select: {'password':0, 'passwordConf':0}
	}).populate({
		path: "user",
		model: User,
		select: {'password':0, 'passwordConf':0}
	}).exec().then((data) => {
		res.json(data)
	})
	
})


var socketIO = require('socket.io-client')
const socket = socketIO.connect('http://127.0.0.1:3000');

router.post('/messages', async (req, res) => {
	const {booking, user, message} = req.body;

	try {
		var msg = new Message({
			booking: booking,
			message: message,
			user: user
		});

		var savedMessage = await msg.save()

		socket.emit('message', booking);
		res.sendStatus(200);

	} catch (error) {
		res.sendStatus(500);
		return console.log('error', error);
	} finally {
		console.log('Message Posted')
	}

})


//--------------------------------------------------------------------
// Render Message
router.get('/promessages/:id', async function (req, res, next) {
	pro = await Pro.findOne({_id: req.session.userId},  {username: 1})
	return res.render("professional/promessages.ejs", {pro: pro, booking: req.params.id});
});

// Display Message from DB
router.get('/promessageslist/:booking', (req, res) => {
	Message.find({booking: req.params.booking})
	.populate({
		path: "pro",
		model: Pro,
	}).populate({
		path: "user",
		model: User,
	}).exec().then((data) => {
		res.json(data)
	})

})




router.post('/promessages', async (req, res) => {
	const {booking, pro, message} = req.body;

	try {
		var msg = new Message({
			booking: booking,
			message: message,
			pro: pro
		});

		var savedMessage = await msg.save()
		console.log('saved');

		socket.emit('message', booking);
		res.sendStatus(200);
	} catch (error) {
		res.sendStatus(500);
		return console.log('error', error);
	} finally {
		console.log('Message Posted')
	}

})
router.get('/deletecategory/:id', async function (req, res, next) {
	console.log(req.params.id);

	await Category.findByIdAndRemove (req.params.id)

	return res.render("admin/delete.ejs", res.redirect('/adminacategories'));
});



module.exports = router;