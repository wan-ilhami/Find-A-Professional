var express = require('express');
var env = require('dotenv').config()
var ejs = require('ejs');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session)
const cookieParser = require('cookie-parser')

var http = require('http').Server(app);
var io = require('socket.io')(http);
var cors = require('cors')


app.use(cors())
app.use(cookieParser());

// mongodb://localhost:27017 127.0.0.1:27017
mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://wan:ilhami@findaprofessional.mtixvbc.mongodb.net/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (!err) {
    console.log('MongoDB Connection Succeeded.');
  } else {
    console.log('Error in DB connection : ' + err);
  }
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
  secret: 'work hard',
  saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: true
}));

// ni lain
app.set("view engine", "ejs")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/css', express.static(path.resolve(__dirname, "asset/css")))
app.use('/img', express.static(path.resolve(__dirname, "asset/img")))
app.use('/js', express.static(path.resolve(__dirname, "asset/js")))
app.use('/vendor', express.static(path.resolve(__dirname, "asset/vendor")))
app.use('/lib', express.static(path.resolve(__dirname, "asset/lib")))
app.use('/scss', express.static(path.resolve(__dirname, "asset/scss")))
app.use('/pic', express.static(path.resolve(__dirname, "asset/img/pic")))



var index = require('./routes/index');
const { socket } = require('socket.io');
app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});

io.on('connection', (socket) =>{
  console.log('a user is connected');

  socket.on('message', (data)=>{
    console.log('ada')
    io.emit(data)
  })
})





var server = http.listen(3000, () => {
  console.log('Server is started on http://127.0.0.1:'+ server.address().port);
});

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, function () {
//   console.log('Server is started on http://127.0.0.1:'+PORT);
// });
