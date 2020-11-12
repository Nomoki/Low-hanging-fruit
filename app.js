const express = require('express');
const bodyParser = require('body-parser');

const cookie = require('cookie-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

const mongoose = require('mongoose');
const http = require('http');
const https = require('https');

const jwt = require('jsonwebtoken')
const config = require('./config.json')
//Define when true when test on localhost
const isTest = true;

//database
mongoose.connect(config.mongoPath, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

if (isTest == false){
    app.use(function (req, res, next) {
        if (req.secure) {
            // request was via https, so do no special handling
            next();
        } else {
            // request was via http, so redirect to https
            res.redirect('https://' + req.headers.host + req.url);
        }
    });
}

app.get('/', function(req, res) {
    res.render('index.ejs');
});
app.use('/public', express.static('public'));

const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

//index rount
app.get('/register', function(req, res){
    res.render('register.ejs', {email: req.query.email, message: req.query.message});
});

app.get('/login', function(req, res){
    res.render('login.ejs', {email: req.query.email, message: req.query.message});
});

//listen on port 80
var httpServer = http.createServer(app);
httpServer.listen(80);

// when test on 
if (isTest == false){

    app.use(cookieSession(
        {
        secret: config.secret,
        httpOnly: true,  // Don't let browser javascript access cookies.
        secure: true, // Only use cookies over https.
        ephemeral: true, //remove when close browser
        domain: config.domain
        })
    );

    const credentials = {key: require('fs').readFileSync('./certificates/privkey.pem')
                    , cert: require('fs').readFileSync('./certificates/fullchain.pem')}
    //listen on port 443
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(443);
}
