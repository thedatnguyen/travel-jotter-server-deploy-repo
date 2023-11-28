const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('./configs/passport');

const indexRouter = require('./routes/indexRouter');
const authRouter = require('./routes/authRouter');
const tripRouter = require('./routes/tripRouter');
const profileRouter = require('./routes/profileRouter');
const timeSectionRouter = require('./routes/timeSectionRouter');
const activityRouter = require('./routes/activityRouter');
const commentRouter = require('./routes/commentRouter');
const tripPictureRouter = require('./routes/tripActivityPictureRouter');
const wishRouter = require('./routes/wishActivityRouter');
const chatRouter = require('./routes/chatRouter');

// config environment
dotenv.config();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	resave: false,
	saveUninitialized: true,
	secret: 'SECRET'
}));

// allow cors
app.use(cors({
	credentials: true,
	origin: '*'
}));

// config passport
app.use(passport.session());
app.use(passport.authenticate('session'));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/trip', tripRouter);
app.use('/profile', profileRouter);
app.use('/timeSection', timeSectionRouter);
app.use('/activity', activityRouter);
app.use('/comment', commentRouter);
app.use('/tripPicture', tripPictureRouter);
app.use('/wish', wishRouter);
app.use('/chat', chatRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500).send({ err })
	// res.render('error');
});

// config golbal constiables
global.__path_default_avatar = `${__dirname}/public/images/default-avatar.png`;
global.__path_background_workers = `${__dirname}/background_workers`

module.exports = app;
